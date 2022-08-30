import katex from "katex";
import { XMLParser, XMLValidator, XMLBuilder } from "fast-xml-parser";
import * as lodash from 'lodash';
import { MathmlParser } from './mathmlParser';


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



export function trykatex(input):[any,MathmlParser.MMParser] {
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
    var options = {
        "preserveOrder": true,
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        stopNodes: ["span.math.semantics.annotaion"]


    };
    const parser = new XMLParser(options);
    let jObj = parser.parse(html);
    var mml:[] = jObj[0].span[0].math[0].semantics;
    // recuIterfp("semantics",mml,0,0);

    let mmp: MathmlParser.MMParser = new MathmlParser.MMParser(mml);
    // MathmlParser.recuObject("mrow",mml,0,cuStringArr);
    // console.log("cuStringArr belowwwwwwwwwwwwwww\n");
    // console.log(mmp.parsedStringArr);
    // cuStringArr.forEach(element => {
    //     console.log(element);

    // });


    // var dp = new DOMParser();
    // var xmlDoc = dp.parseFromString(html, "application/xml");
    // console.log(xmlDoc);

    // recuIterdp(xmlDoc);
    return [html,mmp];



};