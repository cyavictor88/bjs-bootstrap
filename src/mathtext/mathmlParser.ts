import * as lodash from 'lodash';
import { v4 as uuidv4 } from 'uuid';
enum MEleType {
    Start = 0,
    Attris = 1,
    Text = 2,
}


enum MMType {
    Table = 0,
    Tr = 1,
    Td = 2,
    Overunder,

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
    col?:number,
    row?:number,
    
};






export class MMParser {
    public mathmlXml: Object[];
    public parsedStringArr: string[];
    public grandMTagNode: MTag;
    public meleArr: MEle[];
    public grandFlatArr: MMFlatStruct[];
    public grandFlatArrWithClose:MMFlatStruct[];

    

    constructor(mathmlXml: []) {
        this.meleArr = [];
        this.grandFlatArr = [];
        this.grandFlatArrWithClose = [];
        this.grandMTagNode = { name: "dummy", children:[], lvl:-1 };
        this.mathmlXml = mathmlXml;
        this.parsedStringArr = [];

        this.assembleMEleArrByRecuOnObject("mrow", this.mathmlXml, 0, this.parsedStringArr);

        this.assembleGrandMTagNode();
        console.log(this.grandMTagNode);

        this.assembleGrandFlatArr(this.grandMTagNode);
        console.log(this.grandFlatArr);

        this.assembleGrandFlatWithCloseArr();
        console.log(this.grandFlatArrWithClose);

        this.addRowColAttriForTablesInFlatWithCloseArr();
        console.log(this.grandFlatArrWithClose);


        this.getGridLayoutFromFlatWithCloseArr();


    }
    getGridLayoutFromFlatWithCloseArr(){

    };


    addRowColAttriForTablesInFlatWithCloseArr(){
        let curTable:MMFlatStruct={name:"dummyTab",lvl:-1,col:1,row:1};
        for (let i = 0;i < this.grandFlatArrWithClose.length; i+=1)
        {
            const ele=this.grandFlatArrWithClose[i];
            if (ele.name=="mtable" && ele.closeFor==null)
            {
                curTable.col = (curTable.col/curTable.row | 0);
                curTable=ele;
                curTable.col=0;
                curTable.row=0;
            }
            if (ele.name=="mtd" && ele.closeFor==null)
            {
                // curTable.attriArr.at(-2).val+=1;
                curTable.col+=1;
            }
            if (ele.name=="mtr" && ele.closeFor==null)
            {
                curTable.row+=1;
                // curTable.attriArr.at(-1).val+=1;
            }
        } 
        curTable.col = (curTable.col/curTable.row | 0);
    }
    findLastOpenEleAtlvl(j:number):MMFlatStruct{

        for (let i = this.grandFlatArrWithClose.length-1; i>=0 ; i-=1)
        {
            const ele=this.grandFlatArrWithClose[i];
            if (ele.lvl==j && ele.closeFor==null)
            {
                return ele;
            }
        }

    }


    assembleGrandFlatWithCloseArr()
    {
        let lastNode:MMFlatStruct={name:this.grandFlatArr[0].name, lvl:this.grandFlatArr[0].lvl };
        this.grandFlatArr.push(lastNode);
        let prevLvl=-1;
        for (let i = 0; i < this.grandFlatArr.length; i++) {
            const curEle = this.grandFlatArr[i];
            if(curEle.lvl<=prevLvl)
            {
                let j=prevLvl;
                while(j>=curEle.lvl)
                {
                    const lastOpenEleAtLvlj = this.findLastOpenEleAtlvl(j);   
                    let eleThatClose : MMFlatStruct = {name:lastOpenEleAtLvlj.name,lvl:lastOpenEleAtLvlj.lvl,closeFor:lastOpenEleAtLvlj};
                    this.grandFlatArrWithClose.push(eleThatClose);
                    j-=1;
                }
            }
            this.grandFlatArrWithClose.push(curEle);
            prevLvl=curEle.lvl;
        };
        this.grandFlatArrWithClose.pop();
    }

    assembleGrandFlatArr(curNode:MTag)
    {
        var mmstruct : MMFlatStruct={uuid:uuidv4().toString(),lvl:curNode.lvl,name:curNode.name};

        let str = "lvl:"+curNode.lvl+" name:"+curNode.name;
        if(curNode.text!=null)
        {
            str+=" text:"+curNode.text;
            mmstruct.text=curNode.text;
        }
        if(curNode.attriArr!=null)
        {
            str+=" attri:[";
            curNode.attriArr.forEach(attri => {
                str+="{"+attri.name+":"+attri.val+"}"
            });
            str+="]";
            mmstruct.attriArr=curNode.attriArr;
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
