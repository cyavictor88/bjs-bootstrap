import { difference } from 'lodash';
import { MathmlParser as MP } from '../mathmlParser';
// import { create, all,MathArray, MathType } from 'mathjs'
import {Matrix ,Vector4} from "@babylonjs/core";

// const config = {
//    
//   }
// const math = create(all, config);


export interface Dim {
    scale: number,
    xs: [number, number],
    ys: [number, number]
    text?: string,
    nullspace?: boolean,
}
export class EDim {

    public dim: Dim;
    public grandFlatArr: MP.MMFlatStruct[];
    public block: MP.LBlock;
    constructor(block: MP.LBlock, grandFlatArr: MP.MMFlatStruct[]) {
        this.grandFlatArr = grandFlatArr;
        this.block = block;
        this.dim = this.initDim();
        block.edim = this;
    }

    getSpatialTransArr(posArray: number[], trans: { x: number, y: number }, scale: number): number[] {
        let mat = Matrix.Identity();
        mat.setRowFromFloats(0, scale, 0, 0, trans.x);
        mat.setRowFromFloats(1, 0, scale, 0, trans.y);
        mat.setRowFromFloats(2, 0, 0, scale, 0);
        var transedPoses = [];
        for (let i = 0; i < posArray.length; i += 3) {
            let tmpmat = new Matrix();
            tmpmat.setRow(0, new Vector4(posArray[i], posArray[i + 1], 0, 1));
            tmpmat = tmpmat.transpose();
            tmpmat = mat.multiply(tmpmat);
            for (let j = 0; j < 2; j++)
                transedPoses.push(tmpmat.getRow(j).asArray()[0]);
        }
        return transedPoses;
    }


    scaleAndMove(newscale: number, delx: number, dely: number) {

        // let newscaleM = math.multiply(math.identity(3),newscale)   ;

        //     let scaledxs:MathType = math.multiply(newscaleM, [ this.dim.xs[0],this.dim.xs[1],1 ] );
        //     // let scaledys:MathArray = math.multiply(newscaleM,  [ this.dim.ys[0],this.dim.ys[1],1 ] );

        //     console.log(scaledxs.at[0],scaledxs.at[1]);

        // let newxs = this.getSpatialTransArr(this.dim.xs,)
             



        let scaledxlen = newscale * (this.dim.xs[1] - this.dim.xs[0]);
        let scaledylen = newscale * (this.dim.ys[1] - this.dim.ys[0]);

        this.dim.xs[0] += (delx);
        this.dim.xs[1] = this.dim.xs[0] + scaledxlen;
        this.dim.ys[0] += dely;
        this.dim.ys[1] = this.dim.ys[0] + scaledylen;
        this.dim.scale = this.dim.scale * newscale;

        // change to bfs instead of dfs
        if (this.block.children != null) {
            this.block.children.forEach( (child,idx) => {
                    child.edim.scaleAndMove(newscale, delx, dely);
            });
        }

    }

    getxys(): { xs: [number, number], ys: [number, number] } {
        let y0 = Number.MAX_SAFE_INTEGER;
        let y1 = Number.MIN_SAFE_INTEGER;
        let x0 = Number.MAX_SAFE_INTEGER;
        let x1 = Number.MIN_SAFE_INTEGER;
        //let x1 = 
        this.block.children.forEach(child => {
            let dim = child.edim.dim;
            if (dim.ys[0] < y0) y0 = dim.ys[0];
            if (dim.ys[1] > y1) y1 = dim.ys[1];
            if (dim.xs[1] < x0) x0 = dim.xs[0];
            if (dim.xs[1] > x1) x1 = dim.xs[1];
        });
        return { xs: [x0, x1], ys: [y0, y1] };

    }

    initDim(): Dim {
        let block = this.block;
        if (block.type == MP.LBlockType.mi || block.type == MP.LBlockType.mo || block.type == MP.LBlockType.mn) {
            return { scale: 1, xs: [0, block.text.length], ys: [0, 1], text: block.text };
        }
        if (block.type == MP.LBlockType.mstyle) {
            let xys = this.getxys()
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }
        if (block.type == MP.LBlockType.mrow) {
            let y0 = Number.MAX_SAFE_INTEGER;
            let y1 = Number.MIN_SAFE_INTEGER;
            let x0 = block.children[0].edim.dim.xs[0];
            block.children.forEach((child) => {
                let dim = child.edim.dim;
                child.edim.scaleAndMove(1, x0 - dim.xs[0], 0);
                if (dim.ys[0] < y0) y0 = dim.ys[0];
                if (dim.ys[1] > y1) y1 = dim.ys[1];


                x0 = child.edim.dim.xs[1];
                if (child.edim.dim.text!=null)
                 console.log(child.edim.dim.text," new x0:",x0);




            });
            return { scale: 1, xs: [block.children[0].edim.dim.xs[0], x0], ys: [y0, y1] };

        }


        if (block.type == MP.LBlockType.msub) {
            let y0 = Number.MAX_SAFE_INTEGER;
            let y1 = Number.MIN_SAFE_INTEGER;
            let x1 = 0;
            let x0 = 0;
            block.children.forEach((child, idx) => {
                let dim = child.edim.dim;
                if (idx == 0) {
                    x0 = dim.xs[0];
                    x1 = dim.xs[1];
                    y0 = dim.ys[0];
                    y1 = dim.ys[1];
                }
                else if (idx == 1) {
                    let newscale = 0.75;
                    let delx = x1 - x0;
                    let dely = -(newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    child.edim.scaleAndMove(newscale, delx, dely);
                }
            });

            let xys = this.getxys();
            return { scale: 1, xs: xys.xs, ys: xys.ys };




        }

    }


}



export * as EleDim from './EleDim';
