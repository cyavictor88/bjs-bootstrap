import * as lodash from 'lodash';
enum MEleType {
    Start = 0,
    Attris = 1,
    Text = 2,
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
    val: string,
}




export interface MTag {
    name: string,
    children: MTag[],
    lvl: number,
    attriArr?: MAttriDet[],
    parent?: MTag,
    text?: string,
};



export class MMParser {
    public mathmlXml: [];
    public parsedStringArr: string[];
    public grandMTagNode: MTag;
    public meleArr: MEle[];

    constructor(mathmlXml: []) {
        this.meleArr = [];
        this.grandMTagNode = { name: "dummy", children: [], lvl: -1 };
        this.mathmlXml = mathmlXml;
        this.parsedStringArr = [];
        this.recuObject("mrow", this.mathmlXml, 0, this.parsedStringArr);
        this.assembleGrandMTagNode();
        console.log(this.grandMTagNode);

        this.iterAllnodes(this.grandMTagNode);
    }

    iterAllnodes(curNode:MTag)
    {
        let str = "lvl:"+curNode.lvl+" name:"+curNode.name;
        if(curNode.text!=null)
        {
            str+=" text:"+curNode.text;
        }
        console.log(str);

            curNode.children.forEach(element => {
                this.iterAllnodes(element);
            });
        
    }


    traverseToCurLvl(targetLvl) {

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
            let atLvlNode = this.traverseToCurLvl(ele.lvl);
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
    //         this.recuObject(prenodeKey, curArr[i], level, cuStringArr);
    //     }

    // }

    recuObject(prenodeKey, curObj, level, cuStringArr) {

        if (Object.prototype.toString.call(curObj) === '[object Array]') {
            // recuArray(prenodeKey, curObj, level,cuStringArr);
            // return;
            for (var i = 0; i < curObj.length; i++) {
                this.recuObject(prenodeKey, curObj[i], level, cuStringArr);
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
            // cuStringArr.push(prenodeKey + " " + textKey + " " + curObj[textKey] + " level:" + (level - 1).toString());
            var tmpMText: MEle = { node: prenodeKey, lvl: level - 1, text: curObj[textKey], type: MEleType.Text };
            this.meleArr.push(tmpMText);


        }




        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let val = curObj[key];
            if (Object.prototype.toString.call(val) === '[object Array]') {
                // console.log("start " + key + " " + level.toString());
                cuStringArr.push("start " + key + " " + level.toString());
                var tmpMEle: MEle = { node: key, lvl: level, type: MEleType.Start };
                this.meleArr.push(tmpMEle);

                if (lodash.includes(keys, attriKey)) {

                    var attriDets: MAttriDet[] = [];

                    for (var k = 0; k < Object.keys(curObj[attriKey]).length; k++) {

                        var subkey = Object.keys(curObj[attriKey])[k];
                        var subval = curObj[attriKey][subkey];
                        // console.log(key + " " + subkey + " " + subval + " level " + level.toString());
                        cuStringArr.push(key + " " + subkey + " " + subval + " level " + level.toString());
                        attriDets.push({ name: subkey.substring(2), val: subval })
                    }

                    var tmpMAttris: MEle = { node: key, lvl: level, attriArr: attriDets, type: MEleType.Attris };
                    this.meleArr.push(tmpMAttris);

                }
                this.recuObject(key, val, level + 1, cuStringArr);

            }

        }

    }

}



export * as MathmlParser from './mathmlParser';
