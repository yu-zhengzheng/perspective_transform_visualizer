/**
 * 矩阵数学库 - 3x3 矩阵运算 (支持透视变换)
 */

class Matrix3 {
    constructor(data = null) {
        if (data) {
            this.data = new Float64Array(data);
        } else {
            this.data = new Float64Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]);
        }
    }

    get(row, col) { return this.data[row * 3 + col]; }
    set(row, col, value) { this.data[row * 3 + col] = value; }

    multiply(other) {
        const result = new Float64Array(9);
        const a = this.data, b = other.data;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = 0;
                for (let k = 0; k < 3; k++) sum += a[i * 3 + k] * b[k * 3 + j];
                result[i * 3 + j] = sum;
            }
        }
        return new Matrix3(Array.from(result));
    }

    clone() { return new Matrix3(Array.from(this.data)); }

    toArray() { return Array.from(this.data); }

    // ========== 静态工厂方法 ==========

    static identity() { return new Matrix3(); }

    static translation(tx, ty) {
        return new Matrix3([1, 0, tx, 0, 1, ty, 0, 0, 1]);
    }

    static rotation(angle) {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad), s = Math.sin(rad);
        return new Matrix3([c, -s, 0, s, c, 0, 0, 0, 1]);
    }

    static scaling(sx, sy) {
        return new Matrix3([sx, 0, 0, 0, sy, 0, 0, 0, 1]);
    }

    static shearX(shx) {
        return new Matrix3([1, shx, 0, 0, 1, 0, 0, 0, 1]);
    }

    static shearY(shy) {
        return new Matrix3([1, 0, 0, shy, 1, 0, 0, 0, 1]);
    }

    /**
     * 透视变换矩阵 (8参数版本的关键)
     * @param {number} p1 - 第3行第1列的透视参数
     * @param {number} p2 - 第3行第2列的透视参数
     */
    static perspective(p1, p2) {
        // 注意: 这里第3行是 [p1, p2, 1]
        // 这会使得 w = p1*x + p2*y + 1，产生透视效果
        return new Matrix3([1, 0, 0, 0, 1, 0, p1, p2, 1]);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Matrix3 };
}
