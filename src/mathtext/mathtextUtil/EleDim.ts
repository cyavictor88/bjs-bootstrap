import { difference, first } from 'lodash';
import { MathmlParser as MP, MMFlatStruct, OwnedDetail, TabInfo } from '../mathmlParser';
// import { create, all,MathArray, MathType } from 'mathjs'

import * as mathjs from 'mathjs';
import * as lodash from 'lodash';

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
        this.dim = this.setDim();
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

    get_xyBounds_from_children(): { xs: [number, number], ys: [number, number] } {
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

    setDim(): Dim {
        let block = this.block;
        let eleinArray = this.grandFlatArr[block.idxInArray];
        console.log(block.lvl,block.type);
        if (block.type == MP.LBlockType.mi || block.type == MP.LBlockType.mo || block.type == MP.LBlockType.mn) {
            return { scale: 1, xs: [0, block.text.length], ys: [0, 1], text: block.text };
        }
        if (block.type == MP.LBlockType.mstyle) {
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }
        if (block.type == MP.LBlockType.mrow) {
            let y0 = Number.MAX_SAFE_INTEGER;
            let y1 = Number.MIN_SAFE_INTEGER;
            let x0 = block.children[0].edim.dim.xs[0];
            block.children.forEach((child) => {
                let dim = child.edim.dim;
                child.edim.spatialTrans({ delx: x0 - dim.xs[0], dely: 0 }, 1, true);
                if (dim.ys[0] < y0) y0 = dim.ys[0];
                if (dim.ys[1] > y1) y1 = dim.ys[1];
                x0 = child.edim.dim.xs[1];
            });
            return { scale: 1, xs: [block.children[0].edim.dim.xs[0], x0], ys: [y0, y1] };

        }
        if (block.type == MP.LBlockType.msubsup) {
            let baseEle_y0 = 0;
            let baseEle_y1 = 0;
            let baseEle_x1 = 0;
            block.children.forEach((child, idx) => {
                let dim = child.edim.dim;
                let eleinArray = this.grandFlatArr[child.idxInArray];
                let ownedDetailed = lodash.find(eleinArray.ownedDetails, function (o) { return o.owner.uuid === block.uuid; });
                console.log(ownedDetailed);
                // if (idx == 0) {
                if (ownedDetailed.pos == MP.Position.Mid) {
                    baseEle_x1 = dim.xs[1];
                    baseEle_y0 = dim.ys[0];
                    baseEle_y1 = dim.ys[1];
                }
                // else if (idx == 1) {
                else if (ownedDetailed.pos == MP.Position.Down) {
                    let newscale = .75;
                    let delx = baseEle_x1 - dim.xs[0];
                    let dely = -(newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    child.edim.spatialTrans({ delx: delx, dely: dely }, newscale, true);
                }
                // else if (idx == 2) {
                else if (ownedDetailed.pos == MP.Position.Up) {
                    let newscale = .75;
                    let delx = baseEle_x1 - dim.xs[0];
                    let dely = (baseEle_y1 - baseEle_y0) - 0.5 * (newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    child.edim.spatialTrans({ delx: delx, dely: dely }, newscale, true);
                }
            });
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }
        if (block.type == MP.LBlockType.msub || block.type == MP.LBlockType.msup) {

            let baseEle_y0 = 0;
            let baseEle_y1 = 0;
            let baseEle_x1 = 0;
            block.children.forEach((child, idx) => {
                let dim = child.edim.dim;
                let eleinArray = this.grandFlatArr[child.idxInArray];
                let ownedDetailed = lodash.find(eleinArray.ownedDetails, function (o) { return o.owner.uuid === block.uuid; });
                if (ownedDetailed.pos == MP.Position.Mid) {
                    baseEle_x1 = dim.xs[1];
                    baseEle_y0 = dim.ys[0];
                    baseEle_y1 = dim.ys[1];
                }
                else {
                    let newscale = .75;
                    let delx = baseEle_x1 - dim.xs[0];
                    let dely = 0;
                    if (ownedDetailed.pos == MP.Position.Down) {
                        dely = -(newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    }
                    else if (ownedDetailed.pos == MP.Position.Up) {
                        dely = (baseEle_y1 - baseEle_y0) - 0.5 * (newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    }
                    child.edim.spatialTrans({ delx: delx, dely: dely }, newscale, true);
                }
            });
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }

        if (block.type == MP.LBlockType.mtd) {
            let ownedDetail = lodash.findLast(this.grandFlatArr[block.idxInArray].ownedDetails, function (o) { return o.tabDetail != null; })
            let rows = ownedDetail.tabDetail.tab.rows;
            let cols = ownedDetail.tabDetail.tab.cols;
            let rowIdx = ownedDetail.tabDetail.rowIdx;
            let colIdx = ownedDetail.tabDetail.colIdx;
            let tab = ownedDetail.tabDetail.tab;
            let tabcoords = tab.tabcoords;

            if(rows==rowIdx+1 && cols==colIdx+1 )
            {
                let xys = this.get_xyBounds_from_children();
                tabcoords.xs[rowIdx][colIdx]=xys.xs;
                tabcoords.ys[rowIdx][colIdx]=xys.ys;
                return { scale: 1, xs: xys.xs, ys: xys.ys };
            }
            else
            {
                let refrowidx = rowIdx;
                let refcolidx = colIdx-1;
                if(cols==colIdx)
                {
                    refcolidx=colIdx;
                }
                else if(rowIdx==1)
                {
                    refcolidx=1;
                }
            }

            


        }


    }
    getTabInfoUsingRowIdxColIdx(tab:MMFlatStruct,rowIdx:number,colIdx:number):TabInfo{
        this.grandFlatArr.forEach(ele => {
            if (ele.ownedDetails!=null && ele.ownedDetails.length>0) {
                let owndet = lodash.findLast(ele.ownedDetails, function (p) { 
                    return p.tabDetail != null && p.tabDetail.tab.uuid==tab.uuid &&
                p.tabDetail.rowIdx==rowIdx && p.tabDetail.colIdx==colIdx})
                if (owndet!=undefined) {
                    return owndet.tabDetail;
                }
            }
        });
        return {tab:this.grandFlatArr[0],rowIdx:0,colIdx:0};

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
        this.dim.scale *= newscale;
        let transMat = mathjs.multiply(mathjs.identity(3), newscale) as mathjs.Matrix;
        transMat.subset(mathjs.index([0, 1, 2], [2]), [[trans.delx], [trans.dely], [1]]);
        this.getbounds().forEach((b, idx) => {
            let tmpmat = mathjs.multiply(transMat, mathjs.matrix([[b[0]], [b[1]], [1]])) as mathjs.Matrix;
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
