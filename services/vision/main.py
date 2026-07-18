from __future__ import annotations

import base64
import time
from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Lvl UP Lock-In Vision Service")
face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1)

class FramePayload(BaseModel):
    session_id: str
    frame_base64: str

@dataclass
class FocusWindow:
    distracted_since: float | None = None

windows: dict[str, FocusWindow] = {}

LEFT_IRIS = [468, 469, 470, 471]
RIGHT_IRIS = [473, 474, 475, 476]
FACE_BOUNDS = [10, 152, 234, 454]

def decode_frame(data: str) -> np.ndarray:
    if "," in data:
        data = data.split(",", 1)[1]
    raw = base64.b64decode(data)
    arr = np.frombuffer(raw, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Invalid image frame")
    return frame

def centered(points: list[tuple[float, float]]) -> bool:
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    return 0.22 < min(xs) and max(xs) < 0.78 and 0.12 < min(ys) and max(ys) < 0.92

def is_forward_facing(landmarks) -> bool:
    face_points = [(landmarks[i].x, landmarks[i].y) for i in FACE_BOUNDS]
    iris_points = [(landmarks[i].x, landmarks[i].y) for i in LEFT_IRIS + RIGHT_IRIS]
    if not centered(face_points):
        return False
    left_eye_center = sum(landmarks[i].x for i in [33, 133]) / 2
    right_eye_center = sum(landmarks[i].x for i in [362, 263]) / 2
    left_iris = sum(landmarks[i].x for i in LEFT_IRIS) / len(LEFT_IRIS)
    right_iris = sum(landmarks[i].x for i in RIGHT_IRIS) / len(RIGHT_IRIS)
    return abs(left_iris - left_eye_center) < 0.035 and abs(right_iris - right_eye_center) < 0.035

@app.post("/api/verify-focus")
def verify_focus(payload: FramePayload):
    frame = decode_frame(payload.frame_base64)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)
    focused_now = bool(result.multi_face_landmarks and is_forward_facing(result.multi_face_landmarks[0].landmark))
    window = windows.setdefault(payload.session_id, FocusWindow())
    now = time.monotonic()
    if focused_now:
        window.distracted_since = None
        return {"status": "focused"}
    if window.distracted_since is None:
        window.distracted_since = now
    if now - window.distracted_since > 10:
        return {"status": "distracted"}
    return {"status": "focused", "warning": "possible_distraction"}
