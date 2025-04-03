import { GlBuffer, GlProgram } from "./gl";
import { Mat4 } from "./math";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
canvas.width = 800;
canvas.height = 600;
const gl = canvas.getContext("webgl2")!;

if (!gl) {
	throw new Error("Failed to get canvas context");
}

const vertexShaderSource = `
  #version 300 es
  precision highp float; 

  layout(location = 0) in vec3 a_Position; 
  layout(location = 1) in vec4 a_Color;
  uniform mat4 u_ModelViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  out vec4 v_Color;
  void main() {
    v_Color = a_Color;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Position, 1.0);
  }

`.trim();

const fragmentShaderSource = `
  #version 300 es
  precision highp float;

  in vec4 v_Color;
  out vec4 outColor;

  void main() {
    outColor = v_Color;
  }
`.trim();

// prettier-ignore
const vertices = new Float32Array([
    // Front face
    -0.5, -0.5,  0.5,  1.0, 0.0, 0.0,  //  bottom left
     0.5, -0.5,  0.5,  0.0, 1.0, 0.0,  //  bottom right
     0.5,  0.5,  0.5,  0.0, 0.0, 1.0,  // top right
    -0.5,  0.5,  0.5,  1.0, 1.0, 0.0,  // top left
    // Back face
    -0.5, -0.5, -0.5,  1.0, 0.0, 1.0,  // bottom left
     0.5, -0.5, -0.5,  0.0, 1.0, 1.0,  // bottom right
     0.5,  0.5, -0.5,  1.0, 1.0, 1.0,  // top right
    -0.5,  0.5, -0.5,  0.5, 0.5, 0.5,  // top left
]);

// prettier-ignore
const indices = new Uint16Array([
    // Front face (counter-clockwise)
    0, 1, 2,    0, 2, 3,
    // Back face (counter-clockwise when looking from back)
    5, 4, 7,    5, 7, 6,
    // Top face (counter-clockwise when looking from top)
    3, 2, 6,    3, 6, 7,
    // Bottom face (counter-clockwise when looking from bottom)
    4, 5, 1,    4, 1, 0,
    // Right face (counter-clockwise when looking from right)
    1, 5, 6,    1, 6, 2,
    // Left face (counter-clockwise when looking from left)
    4, 0, 3,    4, 3, 7
]);

const program = new GlProgram(gl, vertexShaderSource, fragmentShaderSource);

const vao = gl.createVertexArray();
const vbo = new GlBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, vertices);
const ibo = new GlBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, indices);

gl.bindVertexArray(vao);
vbo.bind();
ibo.bind();

const STRIDE = 6 * vertices.BYTES_PER_ELEMENT;
gl.enableVertexAttribArray(0);
gl.enableVertexAttribArray(1);
// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
// color
gl.vertexAttribPointer(
	1,
	3,
	gl.FLOAT,
	false,
	STRIDE,
	3 * vertices.BYTES_PER_ELEMENT
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

function draw() {
	rotation += 0.01;

	const modelMatrix = new Mat4().rotateY(rotation).rotateX(rotation * 0.5);

	const modelViewMatrix = viewMatrix.multiply(modelMatrix);

	gl.clearColor(0.0, 0.0, 0.0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	program.bind();
	program.setUniformMatrix4fv("u_ModelViewMatrix", false, modelViewMatrix);
	program.setUniformMatrix4fv("u_ProjectionMatrix", false, projectionMatrix);

	gl.bindVertexArray(vao);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

	requestAnimationFrame(draw);
}

// Initialize
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
program.bind();
requestAnimationFrame(draw);
