export type IVec3 = [number, number, number];
export type IVec4 = [number, number, number, number];

export class Vec3 {
	static mag(vec: IVec3): number {
		return Math.hypot(vec[0], vec[1], vec[2]);
	}

	static magSq(vec: IVec3): number {
		return vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2;
	}

	static normalize(v: IVec3): IVec3 {
		const length = this.mag(v);
		if (length === 0) {
			return [0, 0, 0];
		}
		return [v[0] / length, v[1] / length, v[2] / length];
	}
}
export class Mat4 {
	data = new Float32Array(4 * 4);
	constructor() {
		this.data[0] = 1;
		this.data[5] = 1;
		this.data[10] = 1;
		this.data[15] = 1;
	}

	transformPoint(point: IVec3): IVec3 {
		const x = point[0];
		const y = point[1];
		const z = point[2];
		const w = 1;
		const m = this.data;
		return [
			m[0] * x + m[4] * y + m[8] * z + m[12] * w,
			m[1] * x + m[5] * y + m[9] * z + m[13] * w,
			m[2] * x + m[6] * y + m[10] * z + m[14] * w,
		];
	}

	translate(x: number, y: number, z: number) {
		const mat = new Mat4();
		mat.data[12] = x;
		mat.data[13] = y;
		mat.data[14] = z;
		return this.multiply(mat);
	}

	rotateZ(angle: number) {
		if (angle === 0) return this;

		const mat = new Mat4();
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		mat.data[0] = c;
		mat.data[1] = -s;
		mat.data[4] = s;
		mat.data[5] = c;
		return this.multiply(mat);
	}

	rotateY(angle: number) {
		if (angle === 0) return this;

		const mat = new Mat4();
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		mat.data[0] = c;
		mat.data[2] = s;
		mat.data[8] = -s;
		mat.data[10] = c;
		return this.multiply(mat);
	}

	rotateX(angle: number) {
		if (angle === 0) return this;

		const mat = new Mat4();
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		mat.data[5] = c;
		mat.data[6] = -s;
		mat.data[9] = s;
		mat.data[10] = c;
		return this.multiply(mat);
	}

	multiply(other: Mat4) {
		const result = new Mat4();
		const a = this.data;
		const b = other.data;
		const o = result.data;

		// Row 1
		o[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
		o[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
		o[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
		o[12] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];

		// Row 2
		o[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
		o[5] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
		o[9] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
		o[13] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];

		// Row 3
		o[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
		o[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
		o[10] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
		o[14] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];

		// Row 4
		o[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
		o[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
		o[11] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
		o[15] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];

		return result;
	}

	static perspective(fov: number, aspect: number, near: number, far: number) {
		const mat = new Mat4();
		const f = 1.0 / Math.tan(fov / 2);
		mat.data[0] = f / aspect;
		mat.data[5] = f;
		mat.data[10] = (far + near) / (near - far);
		mat.data[11] = -1;
		mat.data[14] = (2 * far * near) / (near - far);
		return mat;
	}

	transpose() {
		const result = new Mat4();
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				result.data[i * 4 + j] = this.data[j * 4 + i];
			}
		}
		return result;
	}

	invert() {
		const result = new Mat4();
		const m = this.data;
		const r = result.data;

		r[0] =
			m[5] * m[10] * m[15] -
			m[5] * m[11] * m[14] -
			m[9] * m[6] * m[15] +
			m[9] * m[7] * m[14] +
			m[13] * m[6] * m[11] -
			m[13] * m[7] * m[10];
		r[4] =
			-m[4] * m[10] * m[15] +
			m[4] * m[11] * m[14] +
			m[8] * m[6] * m[15] -
			m[8] * m[7] * m[14] -
			m[12] * m[6] * m[11] +
			m[12] * m[7] * m[10];
		r[8] =
			m[4] * m[9] * m[15] -
			m[4] * m[11] * m[13] -
			m[8] * m[5] * m[15] +
			m[8] * m[7] * m[13] +
			m[12] * m[5] * m[11] -
			m[12] * m[7] * m[9];
		r[12] =
			-m[4] * m[9] * m[14] +
			m[4] * m[10] * m[13] +
			m[8] * m[5] * m[14] -
			m[8] * m[6] * m[13] -
			m[12] * m[5] * m[10] +
			m[12] * m[6] * m[9];

		r[1] =
			-m[1] * m[10] * m[15] +
			m[1] * m[11] * m[14] +
			m[9] * m[2] * m[15] -
			m[9] * m[3] * m[14] -
			m[13] * m[2] * m[11] +
			m[13] * m[3] * m[10];
		r[5] =
			m[0] * m[10] * m[15] -
			m[0] * m[11] * m[14] -
			m[8] * m[2] * m[15] +
			m[8] * m[3] * m[14] +
			m[12] * m[2] * m[11] -
			m[12] * m[3] * m[10];
		r[9] =
			-m[0] * m[9] * m[15] +
			m[0] * m[11] * m[13] +
			m[8] * m[1] * m[15] -
			m[8] * m[3] * m[13] -
			m[12] * m[1] * m[11] +
			m[12] * m[3] * m[9];
		r[13] =
			m[0] * m[9] * m[14] -
			m[0] * m[10] * m[13] -
			m[8] * m[1] * m[14] +
			m[8] * m[2] * m[13] +
			m[12] * m[1] * m[10] -
			m[12] * m[2] * m[9];

		r[2] =
			m[1] * m[6] * m[15] -
			m[1] * m[7] * m[14] -
			m[5] * m[2] * m[15] +
			m[5] * m[3] * m[14] +
			m[13] * m[2] * m[7] -
			m[13] * m[3] * m[6];
		r[6] =
			-m[0] * m[6] * m[15] +
			m[0] * m[7] * m[14] +
			m[4] * m[2] * m[15] -
			m[4] * m[3] * m[14] -
			m[12] * m[2] * m[7] +
			m[12] * m[3] * m[6];
		r[10] =
			m[0] * m[5] * m[15] -
			m[0] * m[7] * m[13] -
			m[4] * m[1] * m[15] +
			m[4] * m[3] * m[13] +
			m[12] * m[1] * m[7] -
			m[12] * m[3] * m[5];
		r[14] =
			-m[0] * m[5] * m[14] +
			m[0] * m[6] * m[13] +
			m[4] * m[1] * m[14] -
			m[4] * m[2] * m[13] -
			m[12] * m[1] * m[6] +
			m[12] * m[2] * m[5];

		r[3] =
			-m[1] * m[6] * m[11] +
			m[1] * m[7] * m[10] +
			m[5] * m[2] * m[11] -
			m[5] * m[3] * m[10] -
			m[9] * m[2] * m[7] +
			m[9] * m[3] * m[6];
		r[7] =
			m[0] * m[6] * m[11] -
			m[0] * m[7] * m[10] -
			m[4] * m[2] * m[11] +
			m[4] * m[3] * m[10] +
			m[8] * m[2] * m[7] -
			m[8] * m[3] * m[6];
		r[11] =
			-m[0] * m[5] * m[11] +
			m[0] * m[7] * m[9] +
			m[4] * m[1] * m[11] -
			m[4] * m[3] * m[9] -
			m[8] * m[1] * m[7] +
			m[8] * m[3] * m[5];
		r[15] =
			m[0] * m[5] * m[10] -
			m[0] * m[6] * m[9] -
			m[4] * m[1] * m[10] +
			m[4] * m[2] * m[9] +
			m[8] * m[1] * m[6] -
			m[8] * m[2] * m[5];

		let det = m[0] * r[0] + m[1] * r[4] + m[2] * r[8] + m[3] * r[12];
		if (det === 0) {
			throw new Error("Matrix is not invertible");
		}

		det = 1.0 / det;
		for (let i = 0; i < 16; i++) {
			r[i] *= det;
		}

		return result;
	}

	copy(other: Mat4): Mat4 {
		this.data.set(other.data);
		return this;
	}
}

export class Mat3 {
	data = new Float32Array(3 * 3);
	constructor() {
		this.data[0] = 1;
		this.data[4] = 1;
		this.data[8] = 1;
	}

	static fromMat4(mat: Mat4) {
		const result = new Mat3();
		const m = mat.data;
		const r = result.data;
		r[0] = m[0];
		r[1] = m[1];
		r[2] = m[2];
		r[3] = m[4];
		r[4] = m[5];
		r[5] = m[6];
		r[6] = m[8];
		r[7] = m[9];
		r[8] = m[10];
		return result;
	}

	transpose() {
		const result = new Mat3();
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				result.data[i * 3 + j] = this.data[j * 3 + i];
			}
		}
		return result;
	}

	inverse() {
		const result = new Mat3();
		const m = this.data;
		const inv = result.data;

		inv[0] = m[4] * m[8] - m[5] * m[7];
		inv[1] = m[2] * m[7] - m[1] * m[8];
		inv[2] = m[1] * m[5] - m[2] * m[4];
		inv[3] = m[5] * m[6] - m[3] * m[8];
		inv[4] = m[0] * m[8] - m[2] * m[6];
		inv[5] = m[2] * m[3] - m[0] * m[5];
		inv[6] = m[3] * m[7] - m[4] * m[6];
		inv[7] = m[1] * m[6] - m[0] * m[7];
		inv[8] = m[0] * m[4] - m[1] * m[3];

		let det = m[0] * inv[0] + m[1] * inv[3] + m[2] * inv[6];

		if (det === 0) {
			throw new Error("Matrix is not invertible");
		}

		det = 1.0 / det;
		for (let i = 0; i < 9; i++) {
			inv[i] *= det;
		}

		return result;
	}
}

export function degToRad(degree: number) {
	return (degree * Math.PI) / 180;
}
