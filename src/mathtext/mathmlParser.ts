import { Scene } from '@babylonjs/core/scene';
import * as lodash from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { MathMlStringMesh } from './mathml2mesh';

enum MEleType {
    Start = 0,
    Attris = 1,
    Text = 2,
}


enum LBlockType {
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




export interface MTag {
    name: string,
    children: MTag[],
    lvl: number,
    attriArr?: MAttriDet[],
    parent?: MTag,
    text?: string,
};

export interface MMFlatStruct {
    lvl: number,
    name: string,
    text?: string,
    attriArr?: MAttriDet[],
    uuid?: string,
    closeFor?: MMFlatStruct,
    col?: number,
    row?: number,

};



export interface LBlock {
    text?: string,
    pos?: { x: number, y: number },
    hei?: number,
    wid?: number,
    parent?: LBlock,
    children?: LBlock[],
    lvl?: number,

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
    // start?: number,
    // end?: number,
};


export class MMParser {
    public mathmlXml: Object[];
    public parsedStringArr: string[];
    public grandMTagNode: MTag;
    public meleArr: MEle[];
    public grandFlatArr: MMFlatStruct[];
    public grandFlatArrWithClose: MMFlatStruct[];
    public grandLBlockTree: LBlock;




    constructor(mathmlXml: []) {
        this.meleArr = [];
        this.grandFlatArr = [];
        this.grandFlatArrWithClose = [];
        this.grandMTagNode = { name: "dummy", children: [], lvl: -1 };
        this.mathmlXml = mathmlXml;
        this.parsedStringArr = [];

        this.assembleMEleArrByRecuOnObject("mrow", this.mathmlXml, 0, this.parsedStringArr);

        this.assembleGrandMTagNode();
        console.log(this.grandMTagNode);

        this.assembleGrandFlatArr(this.grandMTagNode);
        console.log(this.grandFlatArr);

        this.assembleGrandFlatWithCloseArr();

        this.addRowColAttriForTablesInFlatArrs();
        // console.log(this.grandFlatArrWithClose);
        console.log(this.grandFlatArr);


        this.turnGrandFlatArrToGrandLBlockTree();
        this.addBlockStartEndToGRandBlockTree();


        console.log(this.grandLBlockTree);


        this.iterateGrandBlockTree(this.grandLBlockTree, "");

        // console.log(mathmlXml);


    }

    putinScene(block: LBlock,scene:Scene,layerMask:number, ){
        if (block.children != null && block.children.length > 0) {

            block.children.forEach((child, idx) => {
                this.putinScene(child,scene,layerMask);
            });
        }
        else if (block.text != null) {
            // console.log(block.text.toString());
            // console.log(block.text.toString().length );
            console.log(block.type.toString() + " text:" + block.text + " scale:" + block.scale.toFixed(3) + " x:[" + block.x0.toFixed(3) + "," + block.x1.toFixed(3) + "]" + " y:[" + block.y0.toFixed(3) + "," + block.y1 + "]");

            let xinterval = (block.x1-block.x0)/block.text.toString().length;
            for (let i = 0; i < block.text.toString().length; i++) {
                const char = block.text.toString()[i];
                let box={x0:  (block.x0+i*xinterval)*0.6 ,x1:(block.x0+(i+1)*xinterval)*0.6 ,y0:block.y0,y1:block.y1};
                let mathtxts = new MathMlStringMesh(char , scene, layerMask,box, block.scale);
                mathtxts.toTransedMesh();
                
            }
        



            // let mathtxts = new MathText.MathString(text, scene, layerMask);
        }
        else {
            throw ('som ting wong');
        }
        


    }

    iterateGrandBlockTree(block: LBlock, pad: string) {
        if (block.children != null && block.children.length > 0) {

            block.children.forEach((child, idx) => {
                console.log(child.type.toString() + pad + " yrange:[" + child.miny0.toFixed(3) + "," + child.maxy1.toFixed(3) 
                  + " xrange:[" + child.minx0.toFixed(3) + "," + child.maxx1.toFixed(3) + "]");
                this.iterateGrandBlockTree(child, pad + " ");
            });
            console.log(" ");
        }
        else if (block.text != null) {

            console.log(block.type.toString() + pad + " text:" + block.text + " scale:" + block.scale.toFixed(3) + " x:[" + block.x0.toFixed(3) + "," + block.x1.toFixed(3) + "]" + " y:[" + block.y0.toFixed(3) + "," + block.y1 + "]");
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
        if (type === LBlockType.msub || type === LBlockType.msup || 
            type === LBlockType.mover || type === LBlockType.munder ) {
            if (idx == 0 ) return 1;
            if (idx == 1) return 0.5;
        }

        if(type === LBlockType.msubsup || type === LBlockType.munderover)
        {
            if (idx == 0 ) return 1;
            if (idx == 1) return 0.5;
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
            if (idx == 1) return [block.children[0].x0+0.5*block.scale, y0 - .75 * block.children[0].scale];
            if (idx == 2) return [block.children[0].x0+0.5*block.scale, y0 + .9 * block.children[0].scale];
            else throw ("msubsup wrong");
        }
        return [x0, y0];
    }


    getBlockEndForMTable(block: LBlock, bx0: number, by0: number, bscale: number, 
        miny0: number, maxy1: number,minx0: number, maxx1: number): [number, number] {

        let bx1 = 0;
        let by1 = 0;
        let properBx0 = bx0;
        let properBy0 = by0;
        if (block.children != null && block.children.length > 0) {
            block.children.forEach((child, idx) => {
                bscale = bscale * this.getProperScale(block.type, idx);
                [properBx0, properBy0] = this.getProperX0Y0(block, bx0, by0, bscale, idx);
                child.x0 = properBx0;
                child.y0 = properBy0;
                child.scale = bscale;

                child.miny0 = properBy0;
                child.maxy1 = properBy0 + bscale;

                [bx1, by1] = this.getBlockEnd(child, child.x0, child.y0, child.scale, 
                    miny0, maxy1,minx0, maxx1);
                    
                if (child.miny0 < miny0) miny0 = child.miny0;
                if (child.maxy1 > maxy1) maxy1 = child.maxy1;
                if (child.minx0 < minx0) minx0 = child.minx0;
                if (child.maxx1 > maxx1) maxx1 = child.maxx1;

                bx0 = bx1;
                bx0 = maxx1;
                // if(bx0<bx1) bx0 = bx1;

            });
            block.x1 = bx1;
            block.y1 = by1;

            block.miny0 = miny0;
            block.maxy1 = maxy1;

            block.minx0 = minx0;
            block.maxx1 = maxx1;
            return [bx1, by1];
        }
        else if (block.text != null) {
            // console.log(block);
            let spacing=0;
            // if(block.parent)
            bx1 = bx0 + block.scale * (spacing+block.text.toString().length);
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

        // return [0,0];
    }
    getBlockEnd(block: LBlock, bx0: number, by0: number, bscale: number, 
        miny0: number, maxy1: number, minx0:number,maxx1:number): [number, number] {

        if (block.type == LBlockType.mtable) {
            let numCol=block["col"];
            let numRow=block["row"];
            console.log("mtable row:"+numRow.toString()+ " col:"+ numCol.toString());

            const [_, y1] = this.getBlockEndForMTable(block, bx0, by0, bscale, miny0, maxy1,minx0,maxx1);
            let maxRowYRange = y1-by0;
            let maxRowXRange = 0;

            let mtrminy=Number.MAX_SAFE_INTEGER;
            let mtrmaxy=Number.MIN_SAFE_INTEGER;
            function getTallestRowYrange(disBlock: LBlock) {
                if (disBlock.children != null && disBlock.children.length > 0) {
                    disBlock.children.forEach((child) => {
                        if (child.type = LBlockType.mtr) {
                            if (child.x1 -child.x0> maxRowXRange) maxRowXRange = child.x1 -child.x0;
                            if(child.miny0<mtrminy)mtrminy=child.miny0;
                            if(child.maxy1>mtrmaxy)mtrmaxy=child.maxy1;
                        }
                        else {
                            getTallestRowYrange(child);
                        }
                    });
                }
                return;
            }
            getTallestRowYrange(block);
            console.log("mtable x1:"+(bx0+maxRowXRange).toString()+ " y1:"+(by0+ maxRowYRange*numRow).toString());
            block.x1 = bx0+maxRowXRange;
            block.y1 = by0+ maxRowYRange*numRow;

            if(block.y1>maxy1 )block.maxy1 = block.y1;
            // if(block.y1>maxy1 )block.maxy1 = block.y1;
            block.miny0 = mtrminy;
            block.maxy1 = mtrmaxy;
            
            return [bx0+maxRowXRange ,by0+ maxRowYRange*numRow];
        };
        let bx1 = 0;
        let by1 = 0;
        let properBx0 = bx0;
        let properBy0 = by0;
        if (block.children != null && block.children.length > 0) {

            block.children.forEach((child, idx) => {
                bscale = bscale * this.getProperScale(block.type, idx);
                [properBx0, properBy0] = this.getProperX0Y0(block, bx0, by0, bscale, idx);
                child.x0 = properBx0;
                child.y0 = properBy0;
                child.scale = bscale;

                child.miny0 = properBy0;
                child.maxy1 = properBy0 + bscale;

                child.minx0 = properBx0;
                child.maxx1 = properBx0 + bscale;



                [bx1, by1] = this.getBlockEnd(child, child.x0, child.y0, child.scale, miny0, maxy1,minx0,maxx1);
                if (child.miny0 < miny0) miny0 = child.miny0;
                if (child.maxy1 > maxy1) maxy1 = child.maxy1;
                if (child.minx0 < minx0) minx0 = child.minx0;
                if (child.maxx1 > maxx1) maxx1 = child.maxx1;
                bx0 = bx1;
                bx0 = maxx1;
                
            });


            block.x1 = bx1;
            
            
            block.y1 = by1;

            block.miny0 = miny0;
            block.maxy1 = maxy1;
            block.minx0 = minx0;
            block.maxx1 = maxx1;
            return [bx1, by1];
        }
        else if (block.text != null) {
            // console.log(block);
            bx1 = bx0 + block.scale * block.text.toString().length;
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
        this.getBlockEnd(this.grandLBlockTree, this.grandLBlockTree.x0, this.grandLBlockTree.y0, this.grandLBlockTree.scale, miny0, maxy1 , minx0,maxx1);

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
        this.grandLBlockTree = { children: [], lvl: 0, scale: 1, type: LBlockType.mrow, uuid: this.grandFlatArr[0].uuid };
        let parentOfnewLBlockArr = [this.grandLBlockTree];

        for (let i = 1; i < this.grandFlatArr.length; i += 1) {
            const ele = this.grandFlatArr[i];

            if (ele.closeFor == null) {
                let parentOfnewLBlock = parentOfnewLBlockArr[ele.lvl - 1];
                let newLBlock = { parent: parentOfnewLBlock, scale: parentOfnewLBlock.scale, type: LBlockType[ele.name], uuid: ele.uuid };
                switch (ele.name) {
                    case LBlockType.mo:
                        newLBlock["text"] = ele.text;
                        newLBlock["wid"] = ele.text.length;
                        newLBlock["hei"] = parentOfnewLBlock.scale * newLBlock.scale;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mi:
                        newLBlock["text"] = ele.text;
                        newLBlock["wid"] = ele.text.length;
                        newLBlock["hei"] = parentOfnewLBlock.scale * newLBlock.scale;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mn:
                        newLBlock["text"] = ele.text;
                        newLBlock["wid"] = ele.text.length;
                        newLBlock["hei"] = parentOfnewLBlock.scale * newLBlock.scale;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mtext:
                        newLBlock["text"] = ele.text;
                        newLBlock["wid"] = ele.text.length;
                        newLBlock["hei"] = parentOfnewLBlock.scale * newLBlock.scale;
                        parentOfnewLBlock.children.push(newLBlock);
                        break;
                    case LBlockType.mtable:
                        newLBlock["col"] = ele.col;
                        newLBlock["row"] = ele.row;
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
        let curTable: MMFlatStruct = { name: "dummyTab", lvl: -1, col: 1, row: 1 };
        for (let i = 0; i < this.grandFlatArr.length; i += 1) {
            const ele = this.grandFlatArr[i];
            if (ele.name == "mtable") {
                curTable.col = (curTable.col / curTable.row | 0);
                curTable = ele;
                curTable.col = 0;
                curTable.row = 0;
            }
            if (ele.name == "mtd") {
                // curTable.attriArr.at(-2).val+=1;
                curTable.col += 1;

                let spaceBetweenCol:MMFlatStruct ={name:"mi",lvl:ele.lvl+1,text:" ",uuid:uuidv4().toString()};
                this.grandFlatArr.splice(i+1, 0, spaceBetweenCol);
                i+=1;
            }
            if (ele.name == "mtr") {
                curTable.row += 1;

                // curTable.attriArr.at(-1).val+=1;
            }
        }
        curTable.col = (curTable.col / curTable.row | 0);


        for (let i = 0; i < this.grandFlatArr.length; i += 1) {
            const ele = this.grandFlatArr[i];
            if (ele.name == "mtable") {
                curTable = lodash.find(this.grandFlatArrWithClose, function (o) { return o.uuid == ele.uuid; });
                curTable.col = ele.col;
                curTable.row = ele.row;
            }

        }
        // let curTable: MMFlatStruct = { name: "dummyTab", lvl: -1, col: 1, row: 1 };
        // for (let i = 0; i < this.grandFlatArrWithClose.length; i += 1) {
        //     const ele = this.grandFlatArrWithClose[i];
        //     if (ele.name == "mtable" && ele.closeFor == null) {
        //         curTable.col = (curTable.col / curTable.row | 0);
        //         curTable = ele;
        //         curTable.col = 0;
        //         curTable.row = 0;
        //     }
        //     if (ele.name == "mtd" && ele.closeFor == null) {
        //         // curTable.attriArr.at(-2).val+=1;
        //         curTable.col += 1;
        //     }
        //     if (ele.name == "mtr" && ele.closeFor == null) {
        //         curTable.row += 1;
        //         // curTable.attriArr.at(-1).val+=1;
        //     }
        // }
        // curTable.col = (curTable.col / curTable.row | 0);


        // for (let i = 0; i < this.grandFlatArrWithClose.length; i += 1) {
        //     const ele = this.grandFlatArrWithClose[i];
        //     if (ele.name == "mtable" && ele.closeFor == null) {
        //         curTable=lodash.find(this.grandFlatArr, function(o) { return o.uuid == ele.uuid; });
        //         curTable.col=ele.col;
        //         curTable.row=ele.row;
        //     }

        // }

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
        let lastNode: MMFlatStruct = { name: this.grandFlatArr[0].name, lvl: this.grandFlatArr[0].lvl };
        this.grandFlatArr.push(lastNode);
        let prevLvl = -1;
        for (let i = 0; i < this.grandFlatArr.length; i++) {
            const curEle = this.grandFlatArr[i];
            if (curEle.lvl <= prevLvl) {
                let j = prevLvl;
                while (j >= curEle.lvl) {
                    const lastOpenEleAtLvlj = this.findLastOpenEleAtlvl(j);
                    let eleThatClose: MMFlatStruct = { name: lastOpenEleAtLvlj.name, lvl: lastOpenEleAtLvlj.lvl, closeFor: lastOpenEleAtLvlj };
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
        var mmstruct: MMFlatStruct = { uuid: uuidv4().toString(), lvl: curNode.lvl, name: curNode.name };

        let str = "lvl:" + curNode.lvl + " name:" + curNode.name;
        if (curNode.text != null) {
            str += " text:" + curNode.text;
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
                    var newMTag: MTag = { name: ele.node, lvl: ele.lvl, children: [] };
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
