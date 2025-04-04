import { degToRad, IVec3, IVec4, Mat4, Vec3 } from "./math";

export type CubeProps = {
	position?: IVec3;
	size: number;
	color: IVec4;
};

export function addCube(mesh: Mesh, { size, color }: CubeProps) {
	const [x, y] = [0, 0];
	const hSize = size / 2;
	// front
	addPlane(mesh, x, y, hSize, size, size, color, [0, 0, 0]);

	// back
	addPlane(mesh, x, y, hSize, size, size, color, [0, degToRad(180), 0]);

	// top
	addPlane(mesh, x, y, hSize, size, size, color, [degToRad(90), 0, 0]);

	// bottom
	addPlane(mesh, x, y, hSize, size, size, color, [degToRad(-90), 0, 0]);
	// right
	addPlane(mesh, x, y, hSize, size, size, color, [0, degToRad(90), 0]);

	// left
	addPlane(mesh, x, y, hSize, size, size, color, [0, degToRad(-90), 0]);
}

export function addPlane(
	mesh: Mesh,
	x: number,
	y: number,
	z: number,
	width: number,
	height: number,
	color: IVec4,
	rotation?: IVec3
) {
	let vertices: IVec3[] = [
		[-width / 2, -height / 2, 0], // bottom-left
		[width / 2, -height / 2, 0], // bottom-right
		[width / 2, height / 2, 0], // top-right
		[-width / 2, height / 2, 0], // top-left
	];

	let normal: IVec3 = [0, 0, 1];

	if (rotation && rotation.some((v) => v !== 0)) {
		// First create pure rotation matrix
		const rotationMatrix = new Mat4()
			.rotateX(rotation[0])
			.rotateY(rotation[1])
			.rotateZ(rotation[2]);
		normal = rotationMatrix.transformPoint(normal);
		normal = Vec3.normalize(normal);

		// Create full transform matrix including translation
		const modelMatrix = rotationMatrix.translate(x, y, z);

		// Transform vertices with full matrix
		vertices = vertices.map((v) => modelMatrix.transformPoint(v));
	} else {
		// Just translate if no rotation
		const modelMatrix = new Mat4().translate(x, y, z);
		vertices = vertices.map((v) => modelMatrix.transformPoint(v));
	}

	const vertexOffset = mesh.vertices.length;

	// emit vertices
	for (let i = 0; i < vertices.length; i++) {
		mesh.addVertex(vertices[i], [...color], normal);
	}

	mesh.addTriangle(vertexOffset + 0, vertexOffset + 1, vertexOffset + 2);
	mesh.addTriangle(vertexOffset + 0, vertexOffset + 2, vertexOffset + 3);
}

export class Mesh {
	constructor(public vertices: Vertex[] = [], public indices: number[] = []) {}
	addVertex(position: IVec3, color: IVec4, normal: IVec3) {
		this.vertices.push({ position, color, normal });
	}

	addTriangle(a: number, b: number, c: number) {
		this.indices.push(a, b, c);
	}
}

export interface Vertex {
	position: IVec3;
	color: IVec4;
	normal: IVec3;
}
