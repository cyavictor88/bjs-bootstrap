import { DefaultRenderingPipeline, RegisterMaterialPlugin, TimerState } from '@babylonjs/core';
import { Scene } from '@babylonjs/core/scene';
import { CommonShadowLightPropertyGridComponent } from '@babylonjs/inspector/components/actionTabs/tabs/propertyGrids/lights/commonShadowLightPropertyGridComponent';
import * as lodash from 'lodash';
import { transform } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { MathMlStringMesh } from './mathml2mesh';
import { EleDim as ED } from './mathtextUtil/EleDim';

export enum MEleType {
    Start = 0,
    Attris = 1,
    Text = 2,
}

export enum Position {
    Down = 0,
    Mid = 1,
    Up = 2
}

export enum LBlockType {
    mtable = "mtable",
    mtr = "mtr",
    mtd = "mtd",
    munderover = "munderover",
    mover = "mover",
    munder = "munder",
    msubsup = "msubsup",
    msub = "msub",
    msup = "msup",
    mfrac = "mfrac",
    msqrt = "mssqrt",
    mi = "mi",
    mo = "mo",
    mn = "mn",
    mrow = "mrow",
    mstyle = "mstyle",
    mtext = "mtext",
    mdummy = "mdummy",

}
export interface MEle {
    node: string,
    lvl: number,
    type: MEleType,
    text?: string,
    attriArr?: MAttriDet[],
}

export interface MAttriDet {
    name: string,
    val: any,
}



export interface OwnedDetail {
    owner: MMFlatStruct,
    tabDetail?: TabInfo,
    pos?: Position,
    counter?: number,

}

export interface TabInfo {
    colIdx: number,
    rowIdx: number,

    tab: MMFlatStruct
}

export interface MTag {
    type: LBlockType,

    children: MTag[],
    lvl: number,
    attriArr?: MAttriDet[],
    parent?: MTag,
    text?: string,
};

export interface BlockXY {
    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,

    miny0?: number,
    maxy1?: number,
    minx0?: number,
    maxx1?: number,
    scale?: number,
}

export interface MMFlatStruct {
    lvl: number,
    type: LBlockType,


    blockxy?: BlockXY,

    text?: string,
    attriArr?: MAttriDet[],
    uuid?: string,
    closeFor?: MMFlatStruct,
    cols?: number,
    rows?: number,


    belongToTable?: MMFlatStruct,
    // colIdx?: number,
    // rowIdx?: number,


    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,


    miny0?: number,
    maxy1?: number,

    minx0?: number,
    maxx1?: number,

    scale?: number,

    brakectForTab?: boolean,

    belongArr?: MMFlatStruct[],
    tabs?: TabInfo[],
    ownedDetails?: OwnedDetail[],


    dim?: ED.Dim,



};



export interface LBlock {
    text?: string,
    pos?: { x: number, y: number },
    parent?: LBlock,
    children?: LBlock[],
    lvl?: number,

    idxInArray: number,

    scale: number,
    type: LBlockType,
    uuid: string,

    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,


    miny0?: number,
    maxy1?: number,

    minx0?: number,
    maxx1?: number,


    tEntryH?: number,
    tEntryW?: number,

    colidx?: number,
    rowidx?: number,
    belongToTable?: MMFlatStruct,

    // start?: number,
    // end?: number,

    belongArr?: MMFlatStruct[],


    edim?: ED.EDim,
};


export class MMParser {
    public mathmlXml: Object[];
    public parsedStringArr: string[];
    public grandMTagNode: MTag;
    public meleArr: MEle[];
    public grandFlatArr: MMFlatStruct[];
    public grandFlatArrWithClose: MMFlatStruct[];
    public grandLBlockTree: LBlock;
    public tableStacksofStackY: MMFlatStruct[][];
    public tableStacksofStackX: MMFlatStruct[][];
    public tableTree: LBlock;
    public lvlStack: LBlock[];
    // public tableTree



    constructor(mathmlXml: []) {
        this.meleArr = [];
        this.grandFlatArr = [];
        this.grandFlatArrWithClose = [];
        this.grandMTagNode = { type: LBlockType.mdummy, children: [], lvl: -1 };
        this.mathmlXml = mathmlXml;
        this.parsedStringArr = [];
        this.tableStacksofStackX = [];
        this.tableStacksofStackY = [];
        // this.tableTree= { idxInArray:-1,scale:1,uuid: uuidv4.uuid(), type:LBlockType.mdummy, children:[]};



        // this.tableTree;


        this.assembleMEleArrByRecuOnObject("mrow", this.mathmlXml, 0, this.parsedStringArr);

        this.assembleGrandMTagNode();
        console.log('******staaaaaart asemGrandFlatArr****');
        this.assembleGrandFlatArr(this.grandMTagNode);
        console.log('******enddddd asemGrandFlatArr*******');


        this.assembleGrandFlatWithCloseArr();

        this.addRowColAttriForTablesInFlatArrs();
        // this.addRowColAttriForTablesInClosedFlatArrs();


        // console.log(this.grandFlatArrWithClose);
        // console.log(this.grandFlatArr);


        this.turnGrandFlatArrToGrandLBlockTree();

       //this.addBlockStartEndToGRandBlockTree();
       
       
        // this.addBlockStartEndToArr();




        //this.putBlockStartEndToGrandFlatArr(this.grandLBlockTree);



        // this.markTableInfoinArr();
        this.fillinBelongArr();

        // this.fillinEdimGRandBlockTree();


        // this.rearrangeYForTable();
        // this.rearrangeXForTable();


        // blockxyconsole.log(this.grandLBlockTree);



        // this.grandFlatArr.forEach(element => {
        //     if (element.text != null) {
        //         console.log(element.text)
        //         console.log(element.ownedDetails)
        //     }
        // });

        //main
        // console.log(mathmlXml);

        // using grandblocktree, assemble lvlstack which contains dimension for chars
        this.assembleLvlStack(this.grandLBlockTree);




    }


    addBlockStartEndToArr() {
        let curTable: MMFlatStruct = { type: LBlockType.mdummy, lvl: -1, cols: 1, rows: 1 };
        let tableStack = [];

        let bxy: BlockXY = { x0: 0, y0: 0 };


        this.grandFlatArrWithClose.forEach((ele, idx) => {


            ele.blockxy = { x0: bxy.x0, y0: bxy.y0 };





        });


    }

    getDxDyUsingRowCol(r: number, c: number, rh: number, cw: number) {
        let dx = c * cw;
        let dy = r * rh;
        return [dx, dy];
    }
    getMinx0Miny0(table, minx0, miny0, changeminx0) {

        let tableStack = [table];

        while (tableStack.length > 0) {
            let thisTable = tableStack.pop();
            console.log("rrr");
            let entries = lodash.filter(this.grandFlatArr, function (o) {
                return (o.belongToTable != null &&
                    o.text != null && o.belongToTable.uuid === thisTable.uuid);
            });

            console.log("qq");


            for (let i = 0; i < entries.length; i++) {
                let sub_ele: MMFlatStruct = entries[i];
                if (sub_ele.y0 < miny0) miny0 = sub_ele.y0;
                if (changeminx0) {
                    if (sub_ele.x0 < minx0) minx0 = sub_ele.x0;
                }

            }


            let haveParent = lodash.find(this.grandFlatArr, function (o) {
                return (o.belongToTable != null &&
                    o.type == LBlockType.mtable && o.belongToTable.uuid === thisTable.uuid);
            });

            if (haveParent != null) {
                tableStack.push(haveParent);
            }
        }
        return [minx0, miny0];



        // let miny0 = Number.MAX_SAFE_INTEGER;

        // let minx0 = Number.MAX_SAFE_INTEGER;




    }
    moveDYfromidx(r: number, c: number, newxwid: number, newyhei: number, idx: number, entriesEle: any[]) {
        const ele = this.grandFlatArr[idx];
        if (r == 0) {
            let dx = newxwid - (ele.x1 - ele.x0);
            if (dx < 0) dx = 0;
            let dy = newyhei - (ele.y1 - ele.y0);
            if (dy < 0) dy = 0;
            ele.x1 += dx;
            // ele.y1 += dy;
            for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
                const sub_ele = this.grandFlatArr[i];
                sub_ele.x0 += dx
                sub_ele.x1 += dx;
                // sub_ele.y0 += dy;
                // sub_ele.y1 += dy;
            }
            return;
        }

        if (r > 0) {

            let miny0 = Number.MAX_SAFE_INTEGER;

            let minx0 = Number.MAX_SAFE_INTEGER;
            for (let j = 0; j <= ele.cols; j++) {

                let aboveEntry: [] = entriesEle[r - 1][j];
                if (aboveEntry == null) continue;
                for (let i = 0; i < aboveEntry.length; i++) {
                    let sub_ele: MMFlatStruct = aboveEntry[i];


                    if (sub_ele.type == LBlockType.mtable) {
                        let changeminx0 = (j == c);
                        [minx0, miny0] = this.getMinx0Miny0(sub_ele, minx0, miny0, changeminx0);
                    }
                    else {
                        if (sub_ele.y0 < miny0) miny0 = sub_ele.y0;
                        if (j == c) {
                            if (sub_ele.x0 < minx0) minx0 = sub_ele.x0;
                        }
                    }


                }
            }
            let dy = newyhei - (ele.y1 - ele.y0);
            // if (dy < 0) dy = 0;
            let newy0 = (miny0 - newyhei);
            ele.y0 = newy0;
            // ele.y1 = newy0 + newyhei;

            return;
            let newx0 = minx0;
            let dx = newx0 - ele.x0;

            for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
                const sub_ele = this.grandFlatArr[i];
                // if (sub_ele.x0 == null || sub_ele.x1 == null) continue;
                // if (sub_ele.y0 == null || sub_ele.y1 == null) continue;
                sub_ele.x0 += dx
                sub_ele.x1 += dx;
                // sub_ele.y0 += dy;
                // sub_ele.y1 += dy;
            }
        }

        // let dx = newxwid - (ele.x1 - ele.x0);
        // if (dx < 0) dx = 0;
        // let dy = newyhei - (ele.y1 - ele.y0);

        // ele.x1 += dx;
        // ele.y0 = -newy0;


        // for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
        //     const ele = this.grandFlatArr[i];
        //     // if (ele.x0 == null || ele.x1 == null) continue;
        //     // if (ele.y0 == null || ele.y1 == null) continue;
        //     ele.x0 += dx
        //     ele.x1 += dx;
        //     // ele.y0 += dy;
        //     // ele.y1 += dy;
        // }
    }

    // rearrangeYForTable() {
    //     while (this.tableStacksofStackY.length > 0) {
    //         let tablestack = this.tableStacksofStackY.pop();
    //         console.log("new tablestack:");
    //         while (tablestack.length > 0) {
    //             let oneTable = tablestack.pop();
    //             let entriesSize = [];
    //             let entriesEle = [];
    //             for (let i = 0; i < oneTable.row; i++) {
    //                 entriesSize.push([]);
    //                 entriesEle.push([]);
    //                 for (let j = 0; j < oneTable.col; j++) {
    //                     entriesSize[entriesSize.length - 1].push([-1, -1]);
    //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
    //                         return (o.belongToTable != null
    //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid);
    //                     });
    //                     let parentTable = lodash.find(this.grandFlatArr, function (o) {
    //                         return (o.belongToTable != null && o.type == LBlockType.mtable
    //                             && o.colIdx == j && o.rowIdx == i && o.belongToTable.uuid === oneTable.uuid);
    //                     });
    //                     if (parentTable != null) entries.push(parentTable);

    //                     entriesEle[entriesEle.length - 1].push(entries);
    //                 }
    //             }

    //             // get proper size for each entry (maybe useless)
    //             for (let i = 0; i < oneTable.row; i++) {
    //                 for (let j = 0; j < oneTable.col; j++) {
    //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
    //                         return (o.belongToTable != null)
    //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid;
    //                     });

    //                     entries.forEach(element => {
    //                         let dx = element.x1 - element.x0;
    //                         let dy = element.y1 - element.y0;
    //                         let curdx = entriesSize[i][j][0];
    //                         let curdy = entriesSize[i][j][1];
    //                         if (dx > curdx) curdx = dx;
    //                         if (dy > curdy) curdy = dy;
    //                         entriesSize[i][j] = [curdx, curdy];
    //                         // console.log(i,j,entriesSize[i][j] );
    //                     })
    //                 }
    //             }
    //             let entries = lodash.filter(this.grandFlatArr, function (o) { return (o.belongToTable != null) && o.text != null && o.belongToTable.uuid === oneTable.uuid; });
    //             entries.forEach(element => {

    //                 let index = lodash.findIndex(this.grandFlatArr, function (o) { return o.uuid == element.uuid });
    //                 let c = element.colIdx;
    //                 let r = element.rowIdx;

    //                 if (c >= 0 && r >= 0) {
    //                     let newxwid = entriesSize[r][c][0];
    //                     let newyhei = entriesSize[r][c][1];
    //                     const ele = this.grandFlatArr[index];
    //                     console.log(element.rowIdx, element.colIdx, element.text, r, c, entriesSize[r][c], newxwid - (ele.x1 - ele.x0));
    //                     this.moveDYfromidx(r, c, newxwid, newyhei, index, entriesEle);
    //                 }





    //             });

    //         }
    //     }




    // }

    moveDXfromidx(r: number, c: number, newxwid: number, newyhei: number, idx: number, entriesEle: any[]) {
        const ele = this.grandFlatArr[idx];
        if (r > 0) {

            let miny0 = Number.MAX_SAFE_INTEGER;

            let minx0 = Number.MAX_SAFE_INTEGER;
            let firstEntr: [] = entriesEle[0][c];
            for (let j = 0; j < firstEntr.length; j++) {
                let sub_ele: MMFlatStruct = firstEntr[j];

                if (sub_ele.type == LBlockType.mtable) {
                    let changeminx0 = true;
                    [minx0, miny0] = this.getMinx0Miny0(sub_ele, minx0, miny0, changeminx0);
                }
                else {
                    if (sub_ele.x0 < minx0) minx0 = sub_ele.x0;
                }
            }

            let dx = ele.x0 - (newxwid / 2 + minx0)

            ele.x0 -= dx;
            ele.x1 = ele.x0 + newxwid;
            console.log(newxwid);

            // let dx = ele.x0-minx0;
            // ele.x0 = minx0  ;
            // ele.x1 = minx0+newxwid;

            for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
                const sub_ele = this.grandFlatArr[i];
                sub_ele.x0 -= dx
                sub_ele.x1 -= dx;
            }







        }

        // let dx = newxwid - (ele.x1 - ele.x0);
        // if (dx < 0) dx = 0;
        // let dy = newyhei - (ele.y1 - ele.y0);

        // ele.x1 += dx;
        // ele.y0 = -newy0;


        // for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
        //     const ele = this.grandFlatArr[i];
        //     // if (ele.x0 == null || ele.x1 == null) continue;
        //     // if (ele.y0 == null || ele.y1 == null) continue;
        //     ele.x0 += dx
        //     ele.x1 += dx;
        //     // ele.y0 += dy;
        //     // ele.y1 += dy;
        // }
    }
    // rearrangeXForTable() {
    //     while (this.tableStacksofStackX.length > 0) {
    //         let tablestack = this.tableStacksofStackX.pop();
    //         console.log("new tablestack:");
    //         while (tablestack.length > 0) {
    //             let oneTable = tablestack.pop();
    //             let entriesSize = [];
    //             let entriesEle = [];
    //             for (let i = 0; i < oneTable.row; i++) {
    //                 entriesSize.push([]);
    //                 entriesEle.push([]);
    //                 for (let j = 0; j < oneTable.col; j++) {
    //                     entriesSize[entriesSize.length - 1].push([-1, -1]);
    //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
    //                         return (o.belongToTable != null && o.brakectForTab == null && o.text != " "
    //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid);
    //                     });
    //                     let parentTable = lodash.find(this.grandFlatArr, function (o) {
    //                         return (o.belongToTable != null && o.type == LBlockType.mtable
    //                             && o.colIdx == j && o.rowIdx == i && o.belongToTable.uuid === oneTable.uuid);
    //                     });
    //                     if (parentTable != null) entries.push(parentTable);

    //                     entriesEle[entriesEle.length - 1].push(entries);
    //                 }
    //             }

    //             // get proper size for each entry (maybe useless)
    //             for (let i = 0; i < oneTable.row; i++) {
    //                 for (let j = 0; j < oneTable.col; j++) {
    //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
    //                         return (o.belongToTable != null)
    //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid;
    //                     });

    //                     entries.forEach(element => {
    //                         let dx = element.x1 - element.x0;
    //                         let dy = element.y1 - element.y0;
    //                         let curdx = entriesSize[i][j][0];
    //                         let curdy = entriesSize[i][j][1];
    //                         if (dx > curdx) curdx = dx;
    //                         if (dy > curdy) curdy = dy;
    //                         entriesSize[i][j] = [curdx, curdy];
    //                         // console.log(i,j,entriesSize[i][j] );
    //                     })
    //                 }
    //             }
    //             let entries = lodash.filter(this.grandFlatArr, function (o) { return (o.belongToTable != null) && o.text != null && o.belongToTable.uuid === oneTable.uuid; });
    //             entries.forEach(element => {

    //                 let index = lodash.findIndex(this.grandFlatArr, function (o) { return o.uuid == element.uuid });
    //                 let c = element.colIdx;
    //                 let r = element.rowIdx;

    //                 if (c >= 0 && r >= 0) {
    //                     let newxwid = entriesSize[r][c][0];
    //                     let newyhei = entriesSize[r][c][1];
    //                     const ele = this.grandFlatArr[index];
    //                     console.log(element.rowIdx, element.colIdx, element.text, r, c, entriesSize[r][c], newxwid - (ele.x1 - ele.x0));
    //                     this.moveDXfromidx(r, c, newxwid, newyhei, index, entriesEle);
    //                 }





    //             });

    //         }
    //     }




    // }
    putBlockStartEndToGrandFlatArr(block: LBlock) {

        var blockInArray = this.grandFlatArr[block.idxInArray];//lodash.find(this.grandFlatArr, function (o) { return o.uuid == block.uuid; });
        // var blockInArrayWithClose =lodash.find(this.grandFlatArrWithClose, function (o) { return o.uuid == block.uuid; });
        if (blockInArray != undefined) {
            if (block.maxx1 != null) blockInArray.maxx1 = block.maxx1;
            if (block.maxy1 != null) blockInArray.maxy1 = block.maxy1;
            if (block.minx0 != null) blockInArray.minx0 = block.minx0;
            if (block.miny0 != null) blockInArray.miny0 = block.miny0;
            if (block.y0 != null) blockInArray.y0 = block.y0;
            if (block.y1 != null) blockInArray.y1 = block.y1;
            if (block.x0 != null) blockInArray.x0 = block.x0;
            if (block.x1 != null) blockInArray.x1 = block.x1;
            if (block.scale != null) blockInArray.scale = block.scale;


            blockInArray.blockxy = {
                x0: block.x0, x1: block.x1, y0: block.y0, y1: block.y1, scale: block.scale,
                minx0: block.minx0, miny0: block.miny0, maxx1: block.maxx1, maxy1: block.maxy1
            };
            // console.log(blockInArray.type, blockInArray.blockxy);
        }



        if (block.children != null && block.children.length > 0) {
            block.children.forEach((child, idx) => {
                this.putBlockStartEndToGrandFlatArr(child);
            });
        }

    }


    putinSceneArray(scene: Scene, layerMask: number) {
        let xoffset = -30;
        let xscale = 0.6;


        for (let i = 0; i < this.grandFlatArr.length; i++) {
            const ele = this.grandFlatArr[i];



            if (ele.type == LBlockType.mtd) {
                //console.log("artable:" + ele.belongToTable.substring(0, 4) + " row " + ele.row + " col " + ele.col + " rowidx:" + ele.rowIdx + " colidx:" + ele.colIdx);
            }
            if (ele.type == LBlockType.mtr) {
                // console.log("artable:" + ele.belongToTable.substring(0, 4) + " row " + ele.row + " col " + ele.col + " rowidx:" + ele.rowIdx);
            }

            if (ele.text != null) {
                //console.log(ele.type.toString() + " text:" + ele.text + " scale:" + ele.scale.toFixed(3) + " x:[" + ele.x0.toFixed(3) + "," + ele.x1.toFixed(3) + "]" + " y:[" + ele.y0.toFixed(3) + "," + ele.y1 + "]");


                let xinterval = (ele.x1 - ele.x0) / ele.text.toString().length;
                for (let i = 0; i < ele.text.toString().length; i++) {
                    const char = ele.text.toString()[i];
                    // let box = { x0: (ele.x0 + xoffset + i * xinterval) * xscale, x1: (ele.x0 + xoffset + (i + 1) * xinterval) * xscale, y0: ele.y0, y1: ele.y1 };
                    let box = { x0: (ele.x0 + xoffset + i * xinterval) * xscale, x1: 0, y0: ele.y0, y1: 0 };
                    let mathtxts = new MathMlStringMesh(char, scene, layerMask, box, ele.scale);
                    mathtxts.toTransedMesh();
                }




                // let mathtxts = new MathText.MathString(text, scene, layerMask);
            }


        }

    }


 
    // using grandblocktree, assemble lvlstack which contains dimension for chars
    assembleLvlStack(initblock: LBlock) {
        console.log("start asembleLvlStack:")

        let localLvlStack : LBlock[]= [];
        let stack = [initblock];
        while (stack.length > 0) {
            let block = stack.shift();// pop the first ele from stack
            localLvlStack.push(block);
            if (block.children != null && block.children.length > 0) {
                block.children.forEach((child, idx) => {
                    stack.push(child);
                });
            }
        }

        lodash.reverse(localLvlStack);// now array goes from leaves back to head

        // making edim for each block from leaves
        localLvlStack.forEach(block => {
            block.edim=new ED.EDim(block,this.grandFlatArr);
        });
        console.log("=============");
        
        lodash.reverse(localLvlStack);// now array goes from head to leaves again
        localLvlStack.forEach(block => {
            console.log(block.type + " " + block.lvl.toString() + " " + block.parent.type);
            console.log(block.edim.dim.scale);
            if (block.text != null)
            {
                console.log(block.text);
                console.log(block.edim.dim.xs)
                console.log(block.edim.dim.ys)
                console.log("-----");
            }
        });

        this.lvlStack=localLvlStack;

        console.log("end asembleLvlStack:")

    }


    putinSceneArrayWithED(scene: Scene, layerMask: number) {
        let xoffset = -40;
        let xscale = 0.6; // i manaully try and get width=0.6 to be the size of a char that has heigh = 1


        for (let i = 0; i < this.lvlStack.length; i++) {
            const ele = this.lvlStack[i];

            if (ele.text != null) {
                let eledim = ele.edim.dim;
                let xinterval = (eledim.xs[1] - eledim.xs[0]) / ele.text.toString().length;
                for (let i = 0; i < ele.text.toString().length; i++) {
                    const char = ele.text.toString()[i];
                    let box = { x0: xscale*(eledim.xs[0] + i * xinterval + xoffset ) , x1: -1, y0: eledim.ys[0], y1: -1 };
                    let mathtxts = new MathMlStringMesh(char, scene, layerMask, box, eledim.scale);
                    mathtxts.toTransedMesh();
                }
                // let mathtxts = new MathText.MathString(text, scene, layerMask);
            }


        }

    }

    iterateGrandBlockTree(block: LBlock, pad: string) {
        console.log(block.idxInArray);
        if (block.children != null && block.children.length > 0) {

            block.children.forEach((child, idx) => {

                if (child.type == LBlockType.mtable)
                    console.log(child.type.toString() + pad + " " + block.belongArr + " " + child.lvl + " yrange:[" + child.miny0.toFixed(3) + "," + child.maxy1.toFixed(3)
                        + " xrange:[" + child.minx0.toFixed(3) + "," + child.maxx1.toFixed(3) + "]");

                this.iterateGrandBlockTree(child, pad + " ");
            });
            console.log("children depleted lvl:" + block.lvl);
        }
        else if (block.text != null) {

            console.log(block.idxInArray + " " + block.type.toString() + pad + " " + block.lvl + " " + "text:" + block.text + " scale:" + block.scale.toFixed(3) + " x:[" + block.x0.toFixed(3) + "," + block.x1.toFixed(3) + "]" + " y:[" + block.y0.toFixed(3) + "," + block.y1 + "]");
            // console.log(block.belongArr);
        }
        else {
            throw ('som ting wong');
        }
    }
    // getBlockEnd(block: LBlock, bstart: number): number {
    //     let bend = 0;
    //     if (block.children != null && block.children.length > 0) {
    //         block.children.forEach((child) => {
    //             child.start = bstart;
    //             bend = this.getBlockEnd(child, child.start );
    //             bstart = bend;
    //         });
    //         block.end = bend;
    //         return bend;
    //     }
    //     else if (block.text != null) {
    //         // console.log(block);
    //         bend = bstart + block.text.toString().length;
    //         block.end = bend;
    //         return bend;
    //     }
    //     else {
    //         throw('som ting wong');
    //         return bstart;
    //     }
    // }
    // addBlockStartEndToGRandBlockTree() {

    //     this.grandLBlockTree.start = 0;
    //     this.getBlockEnd(this.grandLBlockTree, this.grandLBlockTree.start);

    // };
    getProperScale(type: LBlockType, idx: number): number {
        let shrinkScale = 0.75

        if (type === LBlockType.msub || type === LBlockType.msup ||
            type === LBlockType.mover || type === LBlockType.munder) {
            if (idx == 0) return 1;
            if (idx == 1) return shrinkScale;
        }

        if (type === LBlockType.msubsup || type === LBlockType.munderover) {
            if (idx == 0) return 1;
            if (idx == 1) return shrinkScale;
            if (idx == 2) return 1;
        }
        return 1;
    };

    getProperX0Y0(block: LBlock, bx0: number, by0: number, bscale: number, blockChildIdx: number): [number, number] {
        let x0 = bx0;
        let y0 = by0;
        let type = block.type;
        let idx = blockChildIdx;
        if (type === LBlockType.msup) {
            if (idx == 0) return [x0, y0];
            if (idx == 1) return [x0, y0 + 0.75 * block.children[0].scale];
            else throw ("msup wrong");
        }
        if (type === LBlockType.msub) {
            if (idx == 0) return [x0, y0];
            if (idx == 1) return [x0, y0 - 0.25 * block.children[0].scale];
            else throw ("msub wrong");
        }
        if (type === LBlockType.msubsup) {
            if (idx == 0) return [x0, y0];
            if (idx == 1) return [x0, y0 - 0.25 * block.children[0].scale];
            if (idx == 2) return [block.children[1].x0, y0 + 0.75 * block.children[0].scale];
            else throw ("msubsup wrong");
        }
        if (type === LBlockType.munderover) {
            if (idx == 0) return [x0, y0];
            if (idx == 1) return [block.children[0].x0, y0 - .75 * block.children[0].scale];
            if (idx == 2) return [block.children[0].x0, y0 + .9 * block.children[0].scale];
            else throw ("msubsup wrong");
        }
        if (type === LBlockType.mover) {
            if (idx == 0) return [x0, y0];
            if (idx == 1) return [block.children[0].x0 + 0.25 * block.scale, y0 + .5 * block.children[0].scale];
            else throw ("msubsup wrong");
        }
        if (type === LBlockType.munder) {
            if (idx == 0) return [x0, y0];
            if (idx == 1) return [block.children[0].x0, y0 - .75 * block.children[0].scale];
            else throw ("msubsup wrong");
        }


        if (type === LBlockType.mfrac) {
            if (idx == 0) return [x0, y0 + 0.5 * block.scale];
            if (idx == 1) return [block.children[0].x0, y0 - 0.5 * block.scale];
        }
        return [x0, y0];
    }


    // getBlockEndForMTable(block: LBlock, bx0: number, by0: number, bscale: number,
    //     miny0: number, maxy1: number, minx0: number, maxx1: number): [number, number] {

    //     let bx1 = 0;
    //     let by1 = 0;
    //     let properBx0 = bx0;
    //     let properBy0 = by0;
    //     if (block.children != null && block.children.length > 0) {
    //         block.children.forEach((child, idx) => {
    //             bscale = bscale * this.getProperScale(block.type, idx);
    //             [properBx0, properBy0] = this.getProperX0Y0(block, bx0, by0, bscale, idx);
    //             child.x0 = properBx0;
    //             child.y0 = properBy0;
    //             child.scale = bscale;

    //             child.miny0 = properBy0;
    //             child.maxy1 = properBy0 + bscale;

    //             [bx1, by1] = this.getBlockEnd(child, child.x0, child.y0, child.scale,
    //                 miny0, maxy1, minx0, maxx1);

    //             if (child.miny0 < miny0) miny0 = child.miny0;
    //             if (child.maxy1 > maxy1) maxy1 = child.maxy1;
    //             if (child.minx0 < minx0) minx0 = child.minx0;
    //             if (child.maxx1 > maxx1) maxx1 = child.maxx1;

    //             bx0 = bx1;
    //             bx0 = maxx1;
    //             // if(bx0<bx1) bx0 = bx1;

    //         });
    //         block.x1 = bx1;
    //         block.y1 = by1;

    //         block.miny0 = miny0;
    //         block.maxy1 = maxy1;

    //         block.minx0 = minx0;
    //         block.maxx1 = maxx1;
    //         return [bx1, by1];
    //     }
    //     else if (block.text != null) {
    //         // console.log(block);
    //         let spacing = 0;
    //         // if(block.parent)
    //         bx1 = bx0 + block.scale * (spacing + block.text.toString().length);
    //         by1 = by0 + block.scale * 1;
    //         block.x1 = bx1;
    //         block.y1 = by1;
    //         if (by0 < miny0) block.miny0 = by0;
    //         if (by1 > maxy1) block.maxy1 = by1;
    //         if (bx0 < minx0) block.minx0 = bx0;
    //         if (bx1 > maxx1) block.maxx1 = bx1;
    //         return [bx1, by1];
    //     }
    //     else {
    //         throw ('som ting wong');
    //     }

    //     // return [0,0];
    // }

    getBlockWithUUID(block: LBlock, uuid: string): LBlock {
        if (block.uuid === uuid) {
            // console.log("found uuid");
            // console.log(block);
            return block;
        }
        let res = null;
        if (block.children != null && block.children.length > 0) {
            for (let i = 0; res == null && i < block.children.length; i++) {
                res = this.getBlockWithUUID(block.children[i], uuid);
            }
        }
        return res;
    }


    putSmallBoxInBigBox(xp0: number, xp1: number, x0: number, x1: number) {
        let newx0 = xp0 + (xp1 - xp0) / 2 - (x1 - x0) / 2;
        return newx0;

    }


    getColIdx(curTotalMTDcnt: number, numCol: number) {
        let colIdx = curTotalMTDcnt % numCol;
        return colIdx;
    }



    fillinBelongArr() {

        function putinOrPulloutFromOwnedDetailsinfo(matchedType: LBlockType, ele: MMFlatStruct, ownedDetailsinfo: OwnedDetail[]) {
            if (ele.type == matchedType && ele.closeFor == null) {
                if(matchedType==LBlockType.mtable)
                {
                    ownedDetailsinfo.push({ owner: ele, tabDetail: { rowIdx: -1, colIdx: -1 ,tab:ele} });
                }
                else{
                    ownedDetailsinfo.push({ owner: ele, counter: -1 });
                }
            }
            else if (ele.type == matchedType && ele.closeFor != null) {
                lodash.remove(ownedDetailsinfo, function (tmp) { return tmp.owner.uuid === ele.closeFor.uuid });
            }
            return ownedDetailsinfo
        }


        let ownedDetailsinfo: OwnedDetail[] = [];


        for (let i = 0; i < this.grandFlatArrWithClose.length; i++) {
            const ele = this.grandFlatArrWithClose[i];


            if (ele.ownedDetails == undefined) {
                ele.ownedDetails = [];
            }
            ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.mfrac, ele, ownedDetailsinfo);
            ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.msub, ele, ownedDetailsinfo);
            ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.msup, ele, ownedDetailsinfo);
            ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.msubsup, ele, ownedDetailsinfo);
            ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.mtable, ele, ownedDetailsinfo);

            if (ele.closeFor!=null) continue;

            for (let j = ownedDetailsinfo.length - 1; j >= 0; j--) {
                let tmpDetail = ownedDetailsinfo[j];
                if (ele.lvl - 1 == tmpDetail.owner.lvl) {
                    tmpDetail.counter = tmpDetail.counter + 1;
                    if (tmpDetail.owner.type == LBlockType.mfrac) {
                        switch (tmpDetail.counter) {
                            case 0:
                                tmpDetail.pos = Position.Up;
                                break;
                            case 1:
                                tmpDetail.pos = Position.Down;
                        }
                    }
                    if (tmpDetail.owner.type == LBlockType.msub) {
                        switch (tmpDetail.counter) {
                            case 0:
                                tmpDetail.pos = Position.Mid;
                                break;
                            case 1:
                                tmpDetail.pos = Position.Down;
                        }
                    }
                    if (tmpDetail.owner.type == LBlockType.msup) {
                        switch (tmpDetail.counter) {
                            case 0:
                                tmpDetail.pos = Position.Mid;
                                break;
                            case 1:
                                tmpDetail.pos = Position.Up;
                        }
                    }
                    if (tmpDetail.owner.type == LBlockType.msubsup) {
                        switch (tmpDetail.counter) {
                            case 0:
                                tmpDetail.pos = Position.Mid;
                                break;
                            case 1:
                                tmpDetail.pos = Position.Down;
                                break;
                            case 2:
                                tmpDetail.pos = Position.Up;
                        }
                    }
                }

            }






            for (let j = ownedDetailsinfo.length - 1; j >= 0; j--) {
                let ownedDetailinfo = ownedDetailsinfo[j];
                if (ownedDetailinfo.owner.type == LBlockType.mtable) {
                    let mostRecentTabInfo = ownedDetailinfo.tabDetail;
                    if (ele.type == LBlockType.mtr && ele.closeFor == null) {
                        mostRecentTabInfo.rowIdx += 1;
                    }
                    if (ele.type == LBlockType.mtd && ele.closeFor == null) {
                        mostRecentTabInfo.colIdx += 1;
                    }
                    if (ele.closeFor != null) continue;
                    mostRecentTabInfo.colIdx = this.getColIdx(mostRecentTabInfo.colIdx, ownedDetailinfo.owner.cols);
                    break;
                }
            }
            for (let j = 0; j <= ownedDetailsinfo.length - 1; j++) {
                let ownedDetailinfo = ownedDetailsinfo[j];
                if (ownedDetailinfo.owner.type == LBlockType.mtable) {
                    let tmptab = ownedDetailinfo.tabDetail;
                    ele.ownedDetails.push({ owner: ownedDetailinfo.owner, tabDetail: { colIdx: tmptab.colIdx, rowIdx: tmptab.rowIdx , tab:tmptab.tab} });
                }
                else {
                    ele.ownedDetails.push({owner:ownedDetailinfo.owner,pos:ownedDetailinfo.pos,counter:ownedDetailinfo.counter});                        
                }
            }








            // if (ele.text!=null) {
                // console.log(ele.text)
                // console.log(ele.ownedDetails)
                // for (let j = ele.ownedDetails.length - 1; j >= 0; j--) {
                //     console.log(ele.ownedDetails[j].pos)
                // }
            // }
        }






    }

    // markTableInfoinArr() {
    //     this.tableStacksofStackX = [];
    //     this.tableStacksofStackY = [];
    //     let curOpenedTable = [];


    //     let tmpTableInfo = { rowIdx: 0, colIdx: 0, tab: this.grandFlatArrWithClose[0] };
    //     for (let i = 0; i < this.grandFlatArrWithClose.length; i += 1) {
    //         const ele = this.grandFlatArrWithClose[i];
    //         // const eleinArray = lodash.find(this.grandFlatArr, function (o) { return o.uuid == ele.uuid; });




    //         if (ele.type == LBlockType.mtable && ele.closeFor == null) {

    //             if (curOpenedTable.length == 0) {
    //                 this.tableStacksofStackX.push([ele]);
    //                 this.tableStacksofStackY.push([ele]);
    //             }
    //             else {
    //                 ele.belongToTable = tmpTableInfo.tab;// mark table in table
    //                 ele.rowIdx = tmpTableInfo.rowIdx;// mark table in table
    //                 ele.colIdx = this.getColIdx(tmpTableInfo.colIdx, tmpTableInfo.tab.col);// mark table in table
    //                 this.tableStacksofStackX[this.tableStacksofStackX.length - 1].push(ele);
    //                 this.tableStacksofStackY[this.tableStacksofStackY.length - 1].push(ele);
    //             }
    //             tmpTableInfo = { rowIdx: -1, colIdx: -1, tab: ele };
    //             curOpenedTable.push(tmpTableInfo);
    //             this.grandFlatArrWithClose[i - 2].belongToTable = ele; // marking "["
    //             this.grandFlatArrWithClose[i - 2].colIdx = 0; // marking "["
    //             this.grandFlatArrWithClose[i - 2].rowIdx = 0; // marking "["
    //             this.grandFlatArrWithClose[i - 2].brakectForTab = true;
    //             continue;

    //         }
    //         if (ele.type == LBlockType.mtable && ele.closeFor != null) {
    //             // this.grandFlatArrWithClose[i + 1].belongToTable = tmpTableInfo.tab; // marking "]"
    //             // this.grandFlatArrWithClose[i + 1].colIdx = tmpTableInfo.tab.col - 1; // marking "]"
    //             // this.grandFlatArrWithClose[i + 1].rowIdx = tmpTableInfo.tab.row - 1; // marking "]"
    //             // this.grandFlatArrWithClose[i + 1].brakectForTab=true;

    //             curOpenedTable.pop();
    //             tmpTableInfo = curOpenedTable[curOpenedTable.length - 1];
    //             i = i + 1
    //             continue;
    //         }
    //         if (curOpenedTable.length == 0 || ele.closeFor != null) continue;


    //         ele.belongToTable = tmpTableInfo.tab;
    //         ele.col = ele.belongToTable.col;
    //         ele.row = ele.belongToTable.row;

    //         // if(ele.type==="mtr" || ele.type==="mtd" ){
    //         //     ele.belongToTable = tmpTableInfo.tab;
    //         //     ele.col=ele.belongToTable.col;
    //         //     ele.row=ele.belongToTable.row;
    //         // }

    //         if (ele.type == LBlockType.mtr) {
    //             tmpTableInfo.rowIdx += 1;
    //             ele.rowIdx = tmpTableInfo.rowIdx;
    //         }
    //         else if (ele.type == LBlockType.mtd) {
    //             ele.rowIdx = tmpTableInfo.rowIdx;
    //             tmpTableInfo.colIdx += 1;
    //             ele.colIdx = this.getColIdx(tmpTableInfo.colIdx, tmpTableInfo.tab.col);
    //         }
    //         else {
    //             // ele.belongToTable = tmpTableInfo.tab;
    //             // ele.col=ele.belongToTable.col;
    //             // ele.row=ele.belongToTable.row;
    //             ele.rowIdx = tmpTableInfo.rowIdx;
    //             ele.colIdx = this.getColIdx(tmpTableInfo.colIdx, tmpTableInfo.tab.col);
    //         }
    //     }


    //     // put colIdx and rowIdx info into "mtd" and "mtr" in granblocktree
    //     // let blockTreeStack = [this.grandLBlockTree];
    //     // while (blockTreeStack.length > 0) {
    //     //     let block = blockTreeStack.pop();
    //     //     if (block.children != null) {
    //     //         block.children.forEach((child, idx) => {
    //     //             blockTreeStack.push(child);
    //     //         })
    //     //     }
    //     //     if (block.type == LBlockType.mtd) {
    //     //         let idx = block.idxInArray;
    //     //         block.colidx = this.grandFlatArr[idx].colIdx;
    //     //         block.rowidx = this.grandFlatArr[idx].rowIdx;
    //     //         block.belongToTable = this.grandFlatArr[idx].belongToTable;
    //     //         // const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === block.belongToTable.uuid);
    //     //         block.col = block.belongToTable.col;
    //     //         block.row = block.belongToTable.row;
    //     //     }
    //     //     if (block.type == LBlockType.mtr) {
    //     //         let idx = block.idxInArray;
    //     //         block.rowidx = this.grandFlatArr[idx].rowIdx;
    //     //         block.belongToTable = this.grandFlatArr[idx].belongToTable;
    //     //         // const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === block.belongToTable.uuid);
    //     //         block.row = block.belongToTable.row;
    //     //     }
    //     // }








    // };

    getBlockEnd(block: LBlock, bx0: number, by0: number, bscale: number,
        miny0: number, maxy1: number, minx0: number, maxx1: number): [number, number] {

        // if (block.type == LBlockType.mtable) {
        //     let numCol = block["col"];
        //     let numRow = block["row"];
        //     console.log("mtable row:" + numRow.toString() + " col:" + numCol.toString());

        //     const [_, y1] = this.getBlockEndForMTable(block, bx0, by0, bscale, miny0, maxy1, minx0, maxx1);
        //     let maxRowYRange = y1 - by0;
        //     let maxRowXRange = 0;

        //     let mtrminy = Number.MAX_SAFE_INTEGER;
        //     let mtrmaxy = Number.MIN_SAFE_INTEGER;
        //     function getTallestRowYrange(disBlock: LBlock) {
        //         if (disBlock.children != null && disBlock.children.length > 0) {
        //             disBlock.children.forEach((child) => {
        //                 if (child.type == LBlockType.mtr) {
        //                     if (child.x1 - child.x0 > maxRowXRange) maxRowXRange = child.x1 - child.x0;
        //                     if (child.miny0 < mtrminy) mtrminy = child.miny0;
        //                     if (child.maxy1 > mtrmaxy) mtrmaxy = child.maxy1;
        //                 }
        //                 else {
        //                     getTallestRowYrange(child);
        //                 }
        //             });
        //         }
        //         return;
        //     }
        //     getTallestRowYrange(block);
        //     console.log("mtable x1:" + (bx0 + maxRowXRange).toString() + " y1:" + (by0 + maxRowYRange * numRow).toString());




        //     block.x1 = bx0 + maxRowXRange;
        //     block.y1 = by0 + maxRowYRange * numRow;

        //     if (block.y1 > maxy1) block.maxy1 = block.y1;
        //     // if(block.y1>maxy1 )block.maxy1 = block.y1;
        //     block.miny0 = mtrminy;
        //     block.maxy1 = mtrmaxy;

        //     return [bx0 + maxRowXRange, by0 + maxRowYRange * numRow];
        // };

        // normal Mtag element
        let bx1 = 0;
        let by1 = 0;
        let properBx0 = bx0;
        let properBy0 = by0;

        if (block.children != null && block.children.length > 0) {

            block.children.forEach((child, idx) => {

                bscale = bscale * this.getProperScale(block.type, idx);
                [properBx0, properBy0] = this.getProperX0Y0(block, bx0, by0, bscale, idx);
                if (block.type == LBlockType.munderover && idx == 2) properBx0 += bscale;

                child.x0 = properBx0;
                child.y0 = properBy0;
                child.scale = bscale;

                child.miny0 = properBy0;
                child.maxy1 = properBy0 + bscale;

                child.minx0 = properBx0;
                child.maxx1 = properBx0 + bscale;



                [bx1, by1] = this.getBlockEnd(child, child.x0, child.y0, child.scale, miny0, maxy1, minx0, maxx1);
                if (child.miny0 < miny0) miny0 = child.miny0;
                if (child.maxy1 > maxy1) maxy1 = child.maxy1;
                if (child.minx0 < minx0) minx0 = child.minx0;
                if (child.maxx1 > maxx1) maxx1 = child.maxx1;

                bx0 = bx1;

                // by0=by1; //trying y
            });


            block.x1 = bx1;


            block.y1 = by1;

            block.miny0 = miny0;
            block.maxy1 = maxy1;
            block.minx0 = minx0;
            block.maxx1 = maxx1;

            if (block.type === LBlockType.msub || block.type === LBlockType.msup || block.type == LBlockType.msubsup ||
                block.type === LBlockType.mover || block.type === LBlockType.munder || block.type === LBlockType.munderover) bx1 = maxx1;
            return [bx1, by1];
        }
        else if (block.text != null) {
            // console.log(block);
            let realBTextLen = block.text.toString().length;

            // for (let i = 0; i < block.text.toString().length; i++) {
            //     if (block.text.toString().charCodeAt(i).toString(16).padStart(4, "0")=="2061")
            //     {
            //         console.log("find itttt"+realBTextLen);
            //         realBTextLen-=1;
            //         if(realBTextLen<0)realBTextLen=0;
            //         console.log("find itttt"+realBTextLen);

            //     }

            // }

            bx1 = bx0 + block.scale * realBTextLen;
            by1 = by0 + block.scale * 1;



            block.x1 = bx1;
            block.y1 = by1;

            if (by0 < miny0) block.miny0 = by0;
            if (by1 > maxy1) block.maxy1 = by1;
            if (bx0 < minx0) block.minx0 = bx0;
            if (bx1 > maxx1) block.maxx1 = bx1;
            return [bx1, by1];
        }
        else {
            throw ('som ting wong');
        }
    }


    addBlockStartEndToGRandBlockTree() {

        this.grandLBlockTree.x0 = 0;
        this.grandLBlockTree.y0 = 0;
        this.grandLBlockTree.miny0 = Number.MAX_SAFE_INTEGER;
        this.grandLBlockTree.minx0 = Number.MAX_SAFE_INTEGER;
        this.grandLBlockTree.maxy1 = Number.MIN_SAFE_INTEGER;
        this.grandLBlockTree.maxx1 = Number.MIN_SAFE_INTEGER;
        let miny0 = Number.MAX_SAFE_INTEGER;
        let minx0 = Number.MAX_SAFE_INTEGER;
        let maxy1 = Number.MIN_SAFE_INTEGER;
        let maxx1 = Number.MIN_SAFE_INTEGER;


        // this.grandLBlockTree.y0 = 0;
        this.getBlockEnd(this.grandLBlockTree, this.grandLBlockTree.x0, this.grandLBlockTree.y0, this.grandLBlockTree.scale, miny0, maxy1, minx0, maxx1);

    };


    addBlockYEndToGrandBlockTree(block: LBlock) {
        if (block.children != null && block.children.length > 0) {


        }
        else if (block.text != null) {
            // console.log(block);

        }
        else {
            throw ('som ting wong');
        }
    };

    addHeightToGrandLBlockTree() {

    };
    turnGrandFlatArrToGrandLBlockTree() {
        this.grandLBlockTree = { children: [], lvl: 0, scale: 1, type: LBlockType.mrow, uuid: this.grandFlatArr[0].uuid, idxInArray: 0, belongArr: [] };
        this.grandLBlockTree.parent = this.grandLBlockTree;
        let parentOfnewLBlockArr = [this.grandLBlockTree];

        for (let i = 1; i < this.grandFlatArr.length; i += 1) {
            const ele = this.grandFlatArr[i];

            if (ele.closeFor == null) {
                let parentOfnewLBlock = parentOfnewLBlockArr[ele.lvl - 1];
                let newLBlock: LBlock = { lvl: ele.lvl, parent: parentOfnewLBlock, scale: parentOfnewLBlock.scale, type: LBlockType[ele.type], uuid: ele.uuid, idxInArray: i, belongArr: [] };
                switch (ele.type) {
                    case LBlockType.mo:
                        newLBlock["text"] = ele.text;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mi:
                        newLBlock["text"] = ele.text;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mn:
                        newLBlock["text"] = ele.text;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mtext:
                        newLBlock["text"] = ele.text;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mtable:
                        newLBlock["col"] = ele.cols;
                        newLBlock["row"] = ele.rows;
                    default:
                        newLBlock["children"] = [];
                        if (ele.lvl == parentOfnewLBlockArr.length) parentOfnewLBlockArr.push(newLBlock);
                        else parentOfnewLBlockArr[ele.lvl] = newLBlock;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                }
            }
        }
    };


    addRowColAttriForTablesInFlatArrs() {
        let curTable: MMFlatStruct = { type: LBlockType.mdummy, lvl: -1, cols: 1, rows: 1 };

        let tableStack = [];


        for (let i = 0; i < this.grandFlatArrWithClose.length; i += 1) {
            const ele = this.grandFlatArrWithClose[i];
            if (ele.type == LBlockType.mtable && ele.closeFor == null) {
                tableStack.push(ele);
                curTable = ele;
                curTable.cols = 0;
                curTable.rows = 0;
            }
            if (ele.type == LBlockType.mtd && ele.closeFor == null) {
                curTable.cols += 1;
                // const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === ele.uuid);
                // let spaceBetweenCol: MMFlatStruct = { type: LBlockType.mi, lvl: ele.lvl + 1, text: " ", uuid: uuidv4().toString() };
                // this.grandFlatArr.splice(index + 1, 0, spaceBetweenCol);


                // this.grandFlatArrWithClose.splice(i + 1, 0, spaceBetweenCol);
                // let spaceBetweenColClose: MMFlatStruct = { type: LBlockType.mi, lvl: ele.lvl + 1, closeFor: spaceBetweenCol };

                // this.grandFlatArrWithClose.splice(i + 2, 0, spaceBetweenColClose);

            }
            if (ele.type == LBlockType.mtr && ele.closeFor == null) {
                curTable.rows += 1;
            }
            if (ele.type == LBlockType.mtable && ele.closeFor != null) {
                curTable.cols = (curTable.cols / curTable.rows | 0);
                console.log("col:" + curTable.cols + " row:" + curTable.rows);

                const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === ele.closeFor.uuid);
                this.grandFlatArr[index].cols = curTable.cols;
                this.grandFlatArr[index].rows= curTable.rows;


                tableStack.pop();
                if (tableStack.length > 0) curTable = tableStack[tableStack.length - 1];
            }
        }

    }
    findLastOpenEleAtlvl(j: number): MMFlatStruct {

        for (let i = this.grandFlatArrWithClose.length - 1; i >= 0; i -= 1) {
            const ele = this.grandFlatArrWithClose[i];
            if (ele.lvl == j && ele.closeFor == null) {
                return ele;
            }
        }

    }


    assembleGrandFlatWithCloseArr() {
        let lastNode: MMFlatStruct = { type: this.grandFlatArr[0].type, lvl: this.grandFlatArr[0].lvl, belongArr: [] };
        this.grandFlatArr.push(lastNode);
        let prevLvl = -1;
        for (let i = 0; i < this.grandFlatArr.length; i++) {
            const curEle = this.grandFlatArr[i];
            if (curEle.lvl <= prevLvl) {
                let j = prevLvl;
                while (j >= curEle.lvl) {
                    const lastOpenEleAtLvlj = this.findLastOpenEleAtlvl(j);
                    let eleThatClose: MMFlatStruct = { type: lastOpenEleAtLvlj.type, lvl: lastOpenEleAtLvlj.lvl, closeFor: lastOpenEleAtLvlj, belongArr: [] };
                    this.grandFlatArrWithClose.push(eleThatClose);
                    j -= 1;
                }
            }
            this.grandFlatArrWithClose.push(curEle);
            prevLvl = curEle.lvl;
        };
        this.grandFlatArrWithClose.pop();
        this.grandFlatArr.pop();
    }

    assembleGrandFlatArr(curNode: MTag) {
        var mmstruct: MMFlatStruct = { uuid: uuidv4().toString(), lvl: curNode.lvl, type: curNode.type, belongArr: [] };

        let str = "lvl:" + curNode.lvl + " name:" + curNode.type;


        if (curNode.text != null) {
            str += " text:" + curNode.text;
            if (curNode.text.toString().charCodeAt(0).toString(16).padStart(4, "0") == "2061") curNode.text = " "; //  null char null space
            mmstruct.text = curNode.text;
        }
        if (curNode.attriArr != null) {
            str += " attri:[";
            curNode.attriArr.forEach(attri => {
                str += "{" + attri.name + ":" + attri.val + "}"
            });
            str += "]";
            mmstruct.attriArr = curNode.attriArr;
        }

        console.log(str);
        this.grandFlatArr.push(mmstruct);

        curNode.children.forEach(element => {
            this.assembleGrandFlatArr(element);
        });

    }


    traverseToCurLvlFromFirstNode(targetLvl) {
        var curlvl = -1;
        let curNode: MTag = this.grandMTagNode;
        let intoNewLvl = false;
        while (curlvl < targetLvl) {
            curlvl += 1;
            if (curNode.children.length > 0) {
                curNode = curNode.children.at(-1);
            }
            else {
                if (curlvl == targetLvl) {
                    intoNewLvl = true;
                }
            }
        }
        return { lastNode: curNode, intoNewLvl: intoNewLvl };
    }

    assembleGrandMTagNode() {
        this.meleArr.forEach(ele => {
            let atLvlNode = this.traverseToCurLvlFromFirstNode(ele.lvl);
            let traversedNode = atLvlNode.lastNode;
            let nextMoveintoNewLvl = atLvlNode.intoNewLvl;
            switch (ele.type) {
                case MEleType.Start:
                    var newMTag: MTag = { type: LBlockType[ele.node], lvl: ele.lvl, children: [] };
                    if (nextMoveintoNewLvl) {
                        // first child in this new level
                        newMTag.parent = traversedNode;
                        traversedNode.children.push(newMTag);
                    }
                    else {
                        newMTag.parent = traversedNode.parent;
                        traversedNode.parent.children.push(newMTag);
                    }
                    break;
                case MEleType.Attris:
                    traversedNode.attriArr = ele.attriArr;
                    break;
                case MEleType.Text:
                    traversedNode.text = ele.text;
                    break;
            }
        });
        this.grandMTagNode = this.grandMTagNode.children[0];
    }






    // recuArray(prenodeKey, curArr, level, cuStringArr) {

    //     for (var i = 0; i < curArr.length; i++) {
    //         this.assembleMEleArrByRecuOnObject(prenodeKey, curArr[i], level, cuStringArr);
    //     }

    // }

    assembleMEleArrByRecuOnObject(prenodeKey, curObj, level, cuStringArr) {

        if (Object.prototype.toString.call(curObj) === '[object Array]') {
            // recuArray(prenodeKey, curObj, level,cuStringArr);
            // return;
            for (var i = 0; i < curObj.length; i++) {
                this.assembleMEleArrByRecuOnObject(prenodeKey, curObj[i], level, cuStringArr);
            }
        }



        let attriKey = ":@";
        let textKey = "#text";
        var keys = Object.keys(curObj);
        for (var j = 0; j < keys.length; j++) {
            let key = keys[j];
            if (key.includes("annotation")) return;
        }

        if (lodash.includes(keys, textKey)) {
            // console.log(prenodeKey + " " + textKey + " " + curObj[textKey] + " level:" + (level - 1).toString());
            //cuStringArr.push(prenodeKey + " " + textKey + " " + curObj[textKey] + " level:" + (level - 1).toString());
            var tmpMText: MEle = { node: prenodeKey, lvl: level - 1, text: curObj[textKey], type: MEleType.Text };
            this.meleArr.push(tmpMText);


        }




        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let val = curObj[key];
            if (Object.prototype.toString.call(val) === '[object Array]') {
                // console.log("start " + key + " " + level.toString());
                //cuStringArr.push("start " + key + " " + level.toString());
                var tmpMEle: MEle = { node: key, lvl: level, type: MEleType.Start };
                this.meleArr.push(tmpMEle);

                if (lodash.includes(keys, attriKey)) {

                    var attriDets: MAttriDet[] = [];

                    for (var k = 0; k < Object.keys(curObj[attriKey]).length; k++) {

                        var subkey = Object.keys(curObj[attriKey])[k];
                        var subval = curObj[attriKey][subkey];
                        // console.log(key + " " + subkey + " " + subval + " level " + level.toString());
                        //cuStringArr.push(key + " " + subkey + " " + subval + " level " + level.toString());
                        attriDets.push({ name: subkey.substring(2), val: subval })
                    }

                    var tmpMAttris: MEle = { node: key, lvl: level, attriArr: attriDets, type: MEleType.Attris };
                    this.meleArr.push(tmpMAttris);

                }
                this.assembleMEleArrByRecuOnObject(key, val, level + 1, cuStringArr);

            }

        }

    }

}



export * as MathmlParser from './mathmlParser';
