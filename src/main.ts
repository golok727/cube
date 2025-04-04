import { Mesh, addCube } from "./geo";
import { GlBuffer, GlProgram } from "./gl";
import { IVec3, Mat3, Mat4, Vec3 } from "./math";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
canvas.width = 800;
canvas.height = 600;
const gl = canvas.getContext("webgl2")!;

if (!gl) {
	throw new Error("Failed to get canvas context");
}

const mesh = new Mesh();
addCube(mesh, {
	position: [0.1, 0.0, 0],
	size: 1,
	color: [1, 0, 0, 1],
});

const positions =
	"[ " +
	mesh.vertices
		.map((v) => v.position.map((v) => v.toFixed(2)))
		.map((v) => `(${v.join(",")})`)
		.join(", ") +
	" ]";

const normals =
	"[ " +
	mesh.vertices
		.map((v) => v.normal.map((v) => v.toFixed(2)))
		.map((v) => `(${v.join(",")})`)
		.join(", ") +
	" ]";

navigator.clipboard.writeText(positions + "\n" + normals).then(
	() => {
		console.log("Copied to clipboard");
	},
	(err) => {
		console.error("Could not copy text: ", err);
	}
);

const vertexShaderSource = `
#version 300 es
precision highp float; 

layout(location = 0) in vec3 a_Position; 
layout(location = 1) in vec4 a_Color;
layout(location = 2) in vec3 a_Normal;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform vec3 u_LightDirection;  
uniform mat3 u_NormalMatrix;

out vec4 v_Color; 
out vec3 v_Light;

void main() {
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Position, 1.0);
    vec3 normal = u_NormalMatrix * a_Normal;

    vec3 ambientLight = vec3(0.1);
    vec3 lightDir = u_LightDirection;

    v_Color = a_Color; 

    vec3 directionalLightColor = vec3(1.0);
    float directionalLightWeighting = max(dot(normal, lightDir), 0.0);

    v_Light = ambientLight + (directionalLightColor * directionalLightWeighting);
}

`.trim();

const fragmentShaderSource = `
#version 300 es
precision highp float;

in vec3 v_Light;
in vec4 v_Color;

out vec4 outColor;

void main() {
    outColor = vec4(v_Color.rgb * v_Light, v_Color.a);
}
`.trim();

const vertices = new Float32Array(
	mesh.vertices.map((v) => [...v.position, ...v.color, ...v.normal]).flat()
);

// prettier-ignore
const indices = new Uint16Array(mesh.indices);

const program = new GlProgram(gl, vertexShaderSource, fragmentShaderSource);

const vao = gl.createVertexArray();
const vbo = new GlBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, vertices);
const ibo = new GlBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, indices);

gl.bindVertexArray(vao);
vbo.bind();
ibo.bind();

const STRIDE = 10 * vertices.BYTES_PER_ELEMENT;
gl.enableVertexAttribArray(0);
gl.enableVertexAttribArray(1);
gl.enableVertexAttribArray(2);
// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
// color
gl.vertexAttribPointer(
	1,
	4,
	gl.FLOAT,
	false,
	STRIDE,
	3 * vertices.BYTES_PER_ELEMENT
);
// normal
gl.vertexAttribPointer(
	2, // location
	3, // size (vec3)
	gl.FLOAT, // type
	false, // normalize
	STRIDE, // stride
	(3 + 4) * vertices.BYTES_PER_ELEMENT // offset
);
gl.bindVertexArray(null);

const projectionMatrix = Mat4.perspective(
	Math.PI / 4,
	canvas.width / canvas.height,
	0.1,
	100
);

const viewMatrix = new Mat4().translate(0, 0, -2);

let rotation = 0;

// const lightDirection: IVec3 = Vec3.normalize([0.85, 0.8, 0.75]);
const lightDirection: IVec3 = Vec3.normalize([0, 0, 10]);
function draw() {
	rotation += 0.01;
	const modelMatrix = new Mat4().rotateY(rotation).rotateX(rotation * 0.5);

	const modelViewMatrix = viewMatrix.multiply(modelMatrix);
	const normalMatrix = Mat3.fromMat4(modelViewMatrix).transpose().inverse();

	gl.clearColor(0.0, 0.0, 0.0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	program.bind();
	program.setUniformMatrix4fv("u_ModelViewMatrix", false, modelViewMatrix);
	program.setUniformMatrix4fv("u_ProjectionMatrix", false, projectionMatrix);
	program.setUniformMatrix3fv("u_NormalMatrix", false, normalMatrix);
	program.setUniform3fv("u_LightDirection", lightDirection);

	gl.bindVertexArray(vao);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

	requestAnimationFrame(draw);
}

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// Initialize
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);
program.bind();
requestAnimationFrame(draw);
