import katex from "katex";
import { XMLParser, XMLValidator, XMLBuilder } from "fast-xml-parser";


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

export function recuIterfp(prenodekey, nodeArr,level) {


    // check if array or object

    for (var i = 0; i < nodeArr.length; i++) {

        var tmpobj = nodeArr[i]; //tmpobj is array or obj  /mrow



        var reorderkeys = [];
        var haslittlemouse=0;
        for (var j = 0; j < Object.keys(tmpobj).length; j++) {
            var key = Object.keys(tmpobj)[j];
            if(key==":@") haslittlemouse=1;
        }
        if(haslittlemouse==1)reorderkeys.push(":@");
        for (var j = 0; j < Object.keys(tmpobj).length; j++) {
            var key = Object.keys(tmpobj)[j];
            if(key!=":@") reorderkeys.push(key);
        }

        // for (var j = 0; j < reorderkeys.length; j++) {
        //         console.log("yooooooooooo:"+reorderkeys[j]);
        // }

        // for (var j = 0; j < Object.keys(tmpobj).length; j++) {
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
                    console.log(reorderkeys[j+1]+" "+key+" "+subkey + " " +subval+" level:"+level.toString());
                }
            }
            if (Object.prototype.toString.call(val) === '[object Array]') {
                // console.log(key+ " " + level.toString());
                recuIterfp(key,val, level+1);
            }
            else
            {

                if(key!=":@")
                {
                    if(key=="#text") level-=1;
                    console.log(prenodekey+" "+key+" "+val +" level:"+(level).toString());

                }
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
    recuIterfp("semantics",mml,0);


    // var dp = new DOMParser();
    // var xmlDoc = dp.parseFromString(html, "application/xml");
    // console.log(xmlDoc);

    // recuIterdp(xmlDoc);
    return html;



};