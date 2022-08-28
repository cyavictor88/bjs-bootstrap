import { difference, first } from 'lodash';
import { MathmlParser as MP } from '../mathmlParser';
// import { create, all,MathArray, MathType } from 'mathjs'

import * as mathjs from 'mathjs';

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

    getbounds() {

        return [[this.dim.xs[0], this.dim.ys[0]], [this.dim.xs[1], this.dim.ys[1]]]
    }





    scaleAndMove(newscale: number, delx: number, dely: number) {

        let newscaleM = mathjs.multiply(mathjs.identity(3), newscale) as mathjs.MathArray;

        let scaledxs = mathjs.multiply(newscaleM, [this.dim.xs[0], this.dim.xs[1], 1]);
        // let scaledys:MathArray = math.multiply(newscaleM,  [ this.dim.ys[0],this.dim.ys[1],1 ] );

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
            this.block.children.forEach((child, idx) => {
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
            let xys = this.getxys();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }
        if (block.type == MP.LBlockType.mrow) {
            let y0 = Number.MAX_SAFE_INTEGER;
            let y1 = Number.MIN_SAFE_INTEGER;
            let x0 = block.children[0].edim.dim.xs[0];
            block.children.forEach((child) => {
                let dim = child.edim.dim;
                // child.edim.scaleAndMove(1, x0 - dim.xs[0], 0);
                child.edim.spatialTrans({ delx: x0 - dim.xs[0], dely: 0 }, 1, true);

                if (dim.ys[0] < y0) y0 = dim.ys[0];
                if (dim.ys[1] > y1) y1 = dim.ys[1];

                x0 = child.edim.dim.xs[1];
                if (child.edim.dim.text != null)
                    console.log(child.edim.dim.text, " new x0:", x0);

            });
            return { scale: 1, xs: [block.children[0].edim.dim.xs[0], x0], ys: [y0, y1] };

        }
        if (block.type == MP.LBlockType.msub || block.type==MP.LBlockType.msup) {
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
                    let newscale = .75;
                    let delx = x1 - dim.xs[0];
                    let dely = 0;
                    if(block.type == MP.LBlockType.msub)
                    {
                        dely = -(newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    }
                    else if(block.type == MP.LBlockType.msup)
                    {
                        dely = ( y1-y0 )-0.5*(newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    }
                    child.edim.spatialTrans( { delx: delx, dely: dely }, newscale, true);
                }
            });
            let xys = this.getxys();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }

        if(block.type == MP.LBlockType.mtd){
            let mms = this.grandFlatArr[block.idxInArray];
            for (let i = mms.ownedDetails.length - 1; i >= 0; i--) {
                const ownedDetail = mms.ownedDetails[i];
                if(ownedDetail.tabDetail!=null)
                {
                    console.log("tabde:",ownedDetail.tabDetail.rowIdx, " ", ownedDetail.tabDetail.colIdx);
                }
                
            }
        }


    }
    spatialTrans(trans: { delx: number, dely: number }, newscale: number, firstime: boolean) {
        // let mat = Matrix.Identity();
        // mat.setRowFromFloats(0, newscale, 0, 0, trans.delx);
        // mat.setRowFromFloats(1, 0, newscale, 0, trans.dely);
        // mat.setRowFromFloats(2, 0, 0, newscale, 0);
        // let bounds = this.getbounds();
        // bounds.forEach((b, idx) => {
        //     let tmpmat = new Matrix();
        //     tmpmat.setRow(0, new Vector4(b[0], b[1], 0, 1));
        //     tmpmat = tmpmat.transpose();
        //     tmpmat = mat.multiply(tmpmat);
        //     this.dim.xs[idx]=tmpmat.getRow(0).asArray()[0];
        //     this.dim.ys[idx]=tmpmat.getRow(1).asArray()[0];
        // });

        // using mathjs
        this.dim.scale*=newscale;
        let transMat = mathjs.multiply(mathjs.identity(3), newscale) as mathjs.Matrix;
        transMat.subset(mathjs.index([0, 1, 2], [2]), [[trans.delx], [trans.dely], [1]]);
        this.getbounds().forEach((b, idx) => {
            let tmpmat = mathjs.multiply( transMat , mathjs.matrix( [[b[0]], [b[1]], [1]] ) ) as mathjs.Matrix;
            this.dim.xs[idx] = tmpmat.get([0, 0]) as number;
            this.dim.ys[idx] = tmpmat.get([1, 0]) as number;
        });

        if (this.block.children != null) {
            this.block.children.forEach((child, idx) => {
                child.edim.spatialTrans(trans, newscale, firstime);
            });
        }
    }

}



export * as EleDim from './EleDim';
