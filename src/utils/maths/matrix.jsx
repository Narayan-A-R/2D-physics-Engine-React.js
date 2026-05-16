import { Vector } from "./vector";
import { quaternion } from "./quaternion";
export class Matrix {
  constructor(m = [[0,0,0],[0,0,0],[0,0,0]]) {
    this.matrix = m
  }

  multVec(v) {
    return new Vector(
        this.matrix[0][0]*v.x + this.matrix[0][1]*v.y + this.matrix[0][2]*v.z,
        this.matrix[1][0]*v.x + this.matrix[1][1]*v.y + this.matrix[1][2]*v.z,
        this.matrix[2][0]*v.x + this.matrix[2][1]*v.y + this.matrix[2][2]*v.z
    );
}


  transpose(){
    return new Matrix([
        [this.matrix[0][0],this.matrix[1][0],this.matrix[2][0]],
        [this.matrix[0][1],this.matrix[1][1],this.matrix[2][1]],
        [this.matrix[0][2],this.matrix[1][2],this.matrix[2][2]]
    ]);
  }

  inv(){
    if (this.matrix.length !== this.matrix[0].length) { return; }
    if (this.matrix.length === 0) { return; }
    if (this.matrix.length[0] === 0) { return; }
    let allZero = 1;
    for (let i = 0; i < this.matrix.length; i++) {
        for (let j = 0; j < this.matrix.length; j++) {
            if(this.matrix[i][j]!==0){
                allZero = 0;
            }
        }
    }
    if(allZero){return new Matrix([0,0,0],[0,0,0],[0,0,0]);}
	var i = 0, ii = 0, j = 0, dim = this.matrix.length, e = 0, t = 0;
	var I = [], C = [];
	for (i = 0; i < dim; i += 1) {
		I[I.length] = [];
		C[C.length] = [];
		for (j = 0; j < dim; j += 1) {

			if (i == j) { I[i][j] = 1; }
			else { I[i][j] = 0; }

			C[i][j] = this.matrix[i][j];
		}
	}

	for (i = 0; i < dim; i += 1) {
		e = C[i][i];

		if (e == 0) {
			for (ii = i + 1; ii < dim; ii += 1) {
				if (C[ii][i] != 0) {
					for (j = 0; j < dim; j++) {
						e = C[i][j];       
						C[i][j] = C[ii][j];
						C[ii][j] = e;      
						e = I[i][j];       
						I[i][j] = I[ii][j];
						I[ii][j] = e;      
					}
					break;
				}
			}

			e = C[i][i];

			if (e == 0) { return }
		}

		for (j = 0; j < dim; j++) {
			C[i][j] = C[i][j] / e; 
			I[i][j] = I[i][j] / e; 
		}


		for (ii = 0; ii < dim; ii++) {
			if (ii == i) { continue; }

			e = C[ii][i];

			for (j = 0; j < dim; j++) {
				C[ii][j] -= e * C[i][j];
				I[ii][j] -= e * I[i][j];
			}
		}
	}

    let res = new Matrix(I);
	// return I;
	return res;
  }
}
