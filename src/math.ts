export type IVec3 = [number, number, number];

export class Mat4 {
	data = new Float32Array(4 * 4);
	constructor() {
		this.data[0] = 1;
		this.data[5] = 1;
		this.data[10] = 1;
		this.data[15] = 1;
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
}
