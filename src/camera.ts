import { IVec3, Mat4 } from "./math";

export interface CameraProps {
	position?: IVec3;
	rotation?: IVec3;
	fov?: number;
	aspect?: number;
	near?: number;
	far?: number;
}

export class Camera {
	private _position: IVec3;
	private _rotation: IVec3;
	private _fov: number;
	private _aspect: number;
	private _near: number;
	private _far: number;
	private _projectionMatrix: Mat4 | null = null;
	private _viewMatrix: Mat4 | null = null;
	private _viewProjectionMatrix: Mat4 | null = null;

	get viewMatrix(): Mat4 {
		if (!this._viewMatrix) {
			this._viewMatrix = new Mat4()
				.rotateZ(this._rotation[2])
				.rotateY(this._rotation[1])
				.rotateX(this._rotation[0])
				.translate(this._position[0], this._position[1], this._position[2]);
		}
		return this._viewMatrix;
	}
	get projectionMatrix(): Mat4 {
		if (!this._projectionMatrix) {
			this._projectionMatrix = Mat4.perspective(
				this._fov,
				this._aspect,
				this._near,
				this._far
			);
		}
		return this._projectionMatrix;
	}

	get viewProjectionMatrix(): Mat4 {
		if (!this._viewProjectionMatrix) {
			this._viewProjectionMatrix = this.projectionMatrix.multiply(
				this.viewMatrix
			);
		}

		return this._viewProjectionMatrix;
	}

	private _createProxy(
		item: any,
		invalidateOptions: { view?: boolean; projection?: boolean }
	) {
		return new Proxy(item, {
			set: (target, prop, value) => {
				let res = Reflect.set(target, prop, value);
				this.invalidate(invalidateOptions);
				return res;
			},
			get(target, prop) {
				return Reflect.get(target, prop);
			},
		});
	}

	constructor({
		position = [0, 0, 0],
		rotation = [0, 0, 0],
		fov = Math.PI / 4,
		aspect = 1,
		near = 0.1,
		far = 1000,
	}: CameraProps = {}) {
		this._position = this._createProxy([...position], { view: true });
		this._rotation = this._createProxy([...rotation], { view: true });
		this._fov = fov;
		this._aspect = aspect;
		this._near = near;
		this._far = far;
	}

	private invalidate({
		view = false,
		projection = false,
	}: {
		view?: boolean;
		projection?: boolean;
	}) {
		if (view) {
			this._viewMatrix = null;
		}
		if (projection) {
			this._projectionMatrix = null;
		}
		this._viewProjectionMatrix = null; // Invalidate view projection matrix
	}

	set position(value: IVec3) {
		this._position = this._createProxy([...value], { view: true });
		this.invalidate({ view: true });
	}

	get position(): IVec3 {
		return this._position;
	}

	set rotation(value: IVec3) {
		this._rotation = this._createProxy([...value], { view: true });
		this.invalidate({ view: true });
	}

	get rotation(): IVec3 {
		return this._rotation;
	}

	set fov(value: number) {
		this._fov = value;
		this.invalidate({ projection: true });
	}

	get fov(): number {
		return this._fov;
	}

	set aspect(value: number) {
		this._aspect = value;
		this.invalidate({ projection: true });
	}

	get aspect(): number {
		return this._aspect;
	}

	set near(value: number) {
		this._near = value;
		this.invalidate({ projection: true });
	}

	get near(): number {
		return this._near;
	}

	set far(value: number) {
		this._far = value;
		this.invalidate({ projection: true });
	}

	get far(): number {
		return this._far;
	}
}
export class CameraController {
	private _pressedKeys = new Set<string>();
	speed = 0.03;
	constructor(private camera: Camera) {}

	update() {
		if (this.isPressed("w")) {
			this.camera.position[2] += this.speed;
		}
		if (this.isPressed("s")) {
			this.camera.position[2] -= this.speed;
		}
		if (this.isPressed("a")) {
			this.camera.position[0] -= this.speed;
		}
		if (this.isPressed("d")) {
			this.camera.position[0] += this.speed;
		}
	}

	isPressed(key: string) {
		return this._pressedKeys.has(key.toLowerCase());
	}

	init() {
		window.addEventListener("keydown", (e) => {
			const key = e.key.toLowerCase();
			this._pressedKeys.add(key);
		});
		window.addEventListener("keyup", (e) => {
			const key = e.key.toLowerCase();
			this._pressedKeys.delete(key);
		});
	}
}
