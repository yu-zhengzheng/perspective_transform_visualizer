<p align="center">
 <img src="https://img.shields.io/badge/Three.js-000?style=flat&logo=three.js&logoColor=white" alt="Three.js">
 <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=white" alt="JavaScript">
 <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT">
</p>

# 🔷 Perspektiva Transformo Bildigilo

> **⚠️ Gravla Deklaracio: Ĉi tiu projekto estas 100% farita per Vibe Programming.**
> 
> Neniu antaŭa dezajndokumento, neniaj detalaj teknikaj specifoj, eĉ ne unu skizo. Nur ideo — "faru retpaĝon por bildigi perspektivajn transformojn" — kaj tiam rekte verki kodon, lasante ĝin kreski nature.

Interaga **3D Perspektiva Transformo Bildigilo** uzante Three.js por prezenti 2D grafikon transformitan en 3D spacon.

---

## ✨ Trajtoj

### Kontroleblaj Parametroj

| Parametro | Priskribo |
|-----------|-----------|
| **Traduko (tx, ty)** | Horizontala/vertikala movo |
| **Rotacio** | Rotacia angulo ĉirkaŭ la origino |
| **Skalo (sx, sy)** | Horizontala/vertikala skalado |
| **Ŝero (shx, shy)** | Horizontala/vertikala ŝerado |
| **Perspektivo (px, py)** | Perspektiva efekto |
| **Z Distanco** | W komponento de perspektiva matrico |

### Ĉefaj Trajtoj

- 🎯 **Realtempa Antaŭvido**: Movu glitilojn por vidi transformojn tuje
- 📐 **Matrica Displayo**: Realtempa 3×3 transforma matrico, rekte editbla
- 🔄 **Duvoja Sinkronigo**: Ŝanĝi matricon aŭ glitilojn aŭtomate sinkronigas la alian
- 📍 **Punta Redaktado**: Aldoni/forigi/modifi verticojn de poligono
- 🎥 **3D Bildigado**: Three.js rendrita 3D vido
- 🖱️ **Kamera Kontrolo**: Trenu por rotacii la vidon

---

## 🚀 Retaliro

**Rekta Ligo**: https://yu-zhengzheng.github.io/perspective_transform_visualizer/

---

## 🚀 Loka Rulo

Simple malfermu `index.html` en via retumilo (funkcias senretaliro):

```bash
# Duoble alklaku index.html
# aŭ
python -m http.server 8000
# Tiam vizitu http://localhost:8000
```

---

## ⚙️ Agordo

Komenca agordo estas en la variablo `configData` ĉe la supro de la HTML dosiero:

```javascript
const configData = {
    "matrix": { "m00": 1, "m01": 0, "m02": 0, "m10": 0, "m11": 1, "m12": 0, "m20": 0, "m21": 0, "m22": 2 },
    "sliders": { "tx": 0, "ty": 0, "rotate": 0, "sx": 1, "sy": 1, "shx": 0, "shy": 0, "px": 0, "py": 0, "tz": 0 },
    "polygon": [[0, 0], [1, 0], [1, 1], [0, 1]]
};
```

---

## 📐 Matematiko

### 3×3 Perspektiva Transformo Matrico

```
| a  b  tx |
| c  d  ty |
| px py  w |
```

Perspektiva transformo konvertas 2D punkton (x, y) al homogenaj koordinatoj (X, Y, W):

```
X = a*x + b*y + tx
Y = c*x + d*y + ty
W = px*x + py*y + w
```

Tiam perspektiva divido donas finajn koordinatojn:

```
x' = X / W
y' = Y / W
```

---

## 📄 License

MIT License - Vidu [LICENSE](LICENSE) dosieron

---

**Feliĉa Kodado! 🚀**