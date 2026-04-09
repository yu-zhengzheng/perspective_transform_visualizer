<p align="center">
 <img src="https://img.shields.io/badge/Three.js-000?style=flat&logo=three.js&logoColor=white" alt="Three.js">
 <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=white" alt="JavaScript">
 <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT">
</p>

# 🔷 Perspective Transform Visualizer

> **⚠️ Important Disclaimer: This project was created using 100% Vibe Coding.**
> 
> No pre-designed documents, no detailed technical specifications, not even a single sketch. Just an idea — "make a webpage to visualize perspective transforms" — and then directly writing code, letting it grow organically.

An interactive **3D Perspective Transform Visualizer** using Three.js to display 2D graphics transformed into 3D space.

---

## ✨ Features

### Controllable Parameters

| Parameter | Description |
|-----------|-------------|
| **Translation (tx, ty)** | Horizontal/vertical movement |
| **Rotation** | Rotation angle around origin |
| **Scale (sx, sy)** | Horizontal/vertical scaling |
| **Shear (shx, shy)** | Horizontal/vertical shearing |
| **Perspective (px, py)** | Perspective effect |
| **Z Distance** | W component of perspective matrix |

### Core Features

- 🎯 **Real-time Preview**: Drag sliders to see transformations instantly
- 📐 **Matrix Display**: Real-time 3×3 transform matrix, editable directly
- 🔄 **Bidirectional Sync**: Modifying matrix or sliders automatically syncs the other
- 📍 **Point Editing**: Add/remove/modify polygon vertices
- 🎥 **3D Visualization**: Three.js rendered 3D view
- 🖱️ **Camera Control**: Drag to rotate view

---

## 🚀 Online Access

**Direct Link**: https://yu-zhengzheng.github.io/perspective_transform_visualizer/

---

## 🚀 Local Run

Simply open `index.html` in your browser (works offline):

```bash
# Double-click index.html
# or
python -m http.server 8000
# Then visit http://localhost:8000
```

---

## ⚙️ Configuration

Initial config is in the `configData` variable at the top of the HTML file:

```javascript
const configData = {
    "matrix": { "m00": 1, "m01": 0, "m02": 0, "m10": 0, "m11": 1, "m12": 0, "m20": 0, "m21": 0, "m22": 2 },
    "sliders": { "tx": 0, "ty": 0, "rotate": 0, "sx": 1, "sy": 1, "shx": 0, "shy": 0, "px": 0, "py": 0, "tz": 0 },
    "polygon": [[0, 0], [1, 0], [1, 1], [0, 1]]
};
```

---

## 📐 Mathematics

### 3×3 Perspective Transform Matrix

```
| a  b  tx |
| c  d  ty |
| px py  w |
```

Perspective transform converts 2D point (x, y) to homogeneous coordinates (X, Y, W):

```
X = a*x + b*y + tx
Y = c*x + d*y + ty
W = px*x + py*y + w
```

Then perspective division gives final coordinates:

```
x' = X / W
y' = Y / W
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

**Happy Coding! 🚀**