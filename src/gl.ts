import { Mat3, Mat4 } from "./math";

export class GlProgram {
	program: WebGLProgram;
	private _uniformLocationCache = new Map<
		string,
		WebGLUniformLocation | null
	>();

	constructor(
		public gl: WebGL2RenderingContext,
		public vertexSrc: string,
		public fragmentSrc: string
	) {
		const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSrc);
		const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSrc);
		const program = gl.createProgram();

		const cleanup = (deleteProgram = true) => {
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			if (deleteProgram) {
				gl.deleteProgram(program);
			}
		};

		if (!program) {
			cleanup();
			throw new Error("Failed to create program");
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program);
			cleanup();
			throw new Error("Failed to link program: " + info);
		}
		cleanup(false);
		this.program = program;
	}

	private _getUniformLocation(name: string): WebGLUniformLocation {
		const location =
			this._uniformLocationCache.get(name) ??
			this.gl.getUniformLocation(this.program, name);
		if (!location) {
			throw new Error(`Failed to get uniform location for ${name}`);
		}
		return location;
	}

	setUniformMatrix3fv(
		name: string,
		transpose: boolean,
		value: Float32Array | Mat3
	) {
		const location = this._getUniformLocation(name);
		if (value instanceof Mat3) {
			value = value.data;
		}
		this.gl.uniformMatrix3fv(location, transpose, value);
	}

	setUniformMatrix4fv(
		name: string,
		transpose: boolean,
		value: Float32Array | Mat4
	) {
		const location = this._getUniformLocation(name);
		if (value instanceof Mat4) {
			value = value.data;
		}
		this.gl.uniformMatrix4fv(location, transpose, value);
	}

	setUniform3fv(name: string, value: number[]) {
		const location = this.gl.getUniformLocation(this.program, name);
		this.gl.uniform3fv(location, value);
	}

	bind() {
		this.gl.useProgram(this.program);
	}

	unbind() {
		this.gl.useProgram(null);
	}

	dispose() {
		this.gl.deleteProgram(this.program);
	}

	private createShader(type: number, source: string): WebGLShader {
		const shader = this.gl.createShader(type);
		if (!shader) {
			throw new Error(
				`Failed to create shader of type ${
					type === this.gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT"
				}`
			);
		}

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const error = this.gl.getShaderInfoLog(shader);
			this.gl.deleteShader(shader);
			throw new Error(
				`Failed to compile shader: ${
					type === this.gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT"
				} ` + error
			);
		}

		return shader;
	}
}

export type TypedArray =
	| Uint8Array
	| Uint16Array
	| Uint32Array
	| Int8Array
	| Int16Array
	| Int32Array
	| Float32Array
	| Float64Array;

export class GlBuffer {
	private _buffer: WebGLBuffer;

	constructor(
		public gl: WebGL2RenderingContext,
		public target: number,
		public usage: number,
		public data: TypedArray
	) {
		const _buffer = gl.createBuffer();
		if (!_buffer) {
			throw new Error("Failed to create buffer");
		}
		this._buffer = _buffer;

		this.gl.bindBuffer(target, _buffer);
		this.gl.bufferData(target, data, usage);
		this.gl.bindBuffer(target, null);
	}

	bind() {
		this.gl.bindBuffer(this.target, this._buffer);
	}

	unbind() {
		this.gl.bindBuffer(this.target, null);
	}

	dispose() {
		this.gl.deleteBuffer(this._buffer);
		this._buffer = null as never;
	}
}
