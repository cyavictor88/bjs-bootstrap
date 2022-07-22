import katex from "katex";
import { XMLParser, XMLValidator, XMLBuilder } from "fast-xml-parser";
import * as lodash from 'lodash';
import {MathmlParser} from './mathmlParser';


export function recuIterdp(node) {
    if (node != null) {
        if (node.childElementCount > 0) {
            for (var i = 0; i < node.childNodes.length; i++) {

                console.log(node.childNodes[i].nodeName + ": " + node.childNodes[i].firstChild.nodeValue);
                recuIterdp(node.childNodes[i]);

            }

        }
        // console.log(node.childNodes[i].nodeName + ": " + node.childNodes[i].nodeValue );
    }

}

export function recuIterfp(prenodekey, nodeArr,level, numNodeProcessed) {


    // check if array or object

    for (var i = 0; i < nodeArr.length; i++) {

        var tmpobj = nodeArr[i]; //tmpobj is array or obj  /mrow



        var reorderkeys = [];
        for (var j = 0; j < Object.keys(tmpobj).length; j++) {

            
            var key = Object.keys(tmpobj)[j];
            console.log("key:"+key);
            if(key!=":@") reorderkeys.push(key);
        }

        if(lodash.includes(Object.keys(tmpobj),":@"))reorderkeys.push(":@");
        // reorderkeys.push("numNodeProcessed");

        // for (var j = 0; j < reorderkeys.length; j++) {
        //         console.log("yooooooooooo:"+reorderkeys[j]);
        // }

        // for (var j = 0; j < Object.keys(tmpobj).length; j++) {
            // numNodeProcessed+=1;
            // tmpobj["numNodeProcessed"]=numNodeProcessed;

        for (var j = 0; j < reorderkeys.length; j++) {

            

            // var key = Object.keys(tmpobj)[j];
            var key:string = reorderkeys[j];




            var val = tmpobj[key];

            if( key.includes("annotation"))
            {
                continue;
            }
            if(key==":@")
            {
                for (var k = 0; k < Object.keys(val).length; k++) {

                    var subkey = Object.keys(val)[k];
                    var subval = val[subkey];
                    console.log(reorderkeys[j-1]+" "+subkey + " " +subval+" level:"+level.toString());
                }
                // continue;
            }
            if (Object.prototype.toString.call(val) === '[object Array]') {
                console.log("start:"+key+ " " + level.toString());
                recuIterfp(key,val, level+1,numNodeProcessed+1);
                // console.log(" done");

            }
            else
            {

                // if(key!=":@")
                // {
                    if(key=="#text")
                    { 
                        level-=1;
                        console.log(prenodekey+" "+key+" "+val +" level:"+(level).toString());
                    }

                // }
            }


        }



        //recuIterfp(tmpobj[Object.keys(tmpobj)[i]]);
        //}
        // else {
        //     for (var j = 0; j < Object.keys(tmpobj).length; j++) {

        //         console.log(tmpobj[Object.keys(tmpobj)[j]]);
        //     }
        // }




    }
    // else
    // {
    //     for (var i = 0; i <Object.keys(nodeArr).length ;i++) {

    //         console.log(nodeArr[Object.keys(nodeArr)[i]]  );
    //     }
    // }


}

export function trykatex(input) {
    // var element = document.createElement("p");
    // katex.render("zz = \\pm\\sqrt{a^2 + b^2}", element, {
    //     throwOnError: false,
    //     output: "mathml",
    //     displayMode: true
    // });
    // console.log(element);
    // var html = katex.renderToString("f(x) = \\int_{-\\infty}^\\inftyf(\\hat\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi", {
        var html = katex.renderToString(input, {
        throwOnError: false,
        output: "mathml",
        displayMode: true,
    });
    console.log(html);
    var options = { "preserveOrder": true ,
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    allowBooleanAttributes: true,
    stopNodes: ["span.math.semantics.annotaion"]


};
    const parser = new XMLParser(options);
    let jObj = parser.parse(html);

    var mml = jObj[0].span[0].math[0].semantics;

    console.log(mml);
    // recuIterfp("semantics",mml,0,0);

    let mmp: MathmlParser.MMParser = new MathmlParser.MMParser(mml);
    // MathmlParser.recuObject("mrow",mml,0,cuStringArr);
    console.log("cuStringArr belowwwwwwwwwwwwwww\n");
    console.log(mmp.parsedStringArr);
    // cuStringArr.forEach(element => {
    //     console.log(element);
        
    // });


    // var dp = new DOMParser();
    // var xmlDoc = dp.parseFromString(html, "application/xml");
    // console.log(xmlDoc);

    // recuIterdp(xmlDoc);
    return html;



};