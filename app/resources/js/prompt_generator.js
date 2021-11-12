function createButton(context, num) {
    var button = document.createElement("button");
    button.className = "rounded bg-dark btn-outline-dark text-light";
    button.innerText = "Save " + num;
    //button.onclick = func;

    var li = document.createElement('li');
    li.className = "list-group-item";
    li.setAttribute("style", "text-align: center;");

    li.appendChild(button)
    context.appendChild(li);
}

function savePrompt(){
    let saveLi = document.getElementById('savedPromptList');
    num = (saveLi.childNodes.length) - 1;

    createButton(saveLi,num + 1);
}

//function Helpers_log(x) {\n
//    Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toConsole\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"interpolate\"])(\"###%P()\", [x]));\n
//}

//class Request_T extends _fable_fable_library_3_2_9_Types_js__WEBPACK_IMPORTED_MODULE_1__[\"Record\"] {\n
//    constructor(Context, TopP, Temperature, ResponseLength, RemoveInput) {\n
//        super();\n
//        this.Context = Context;\n
//        this.TopP = TopP;\
//        this.Temperature = Temperature;\n
//this.ResponseLength = (ResponseLength | 0);\n
//        this.RemoveInput = RemoveInput;\n
//    }\n
//}

//function Request_T$reflection() {\n
//    return Object(_fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"record_type\"])(\"App.Request.T\", [], Request_T, () => [[\"Context\", _fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"string_type\"]], [\"TopP\", Object(_fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"class_type\"])(\"System.Decimal\")], [\"Temperature\", Object(_fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"class_type\"])(\"System.Decimal\")], [\"ResponseLength\", _fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"int32_type\"]], [\"RemoveInput\", _fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"bool_type\"]]]);\n}\n\nfunction Request_stringify(x) {\n
//    return Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toText\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"interpolate\"])(\"{\\\"context\\\":\\\"%s%P()\\\",\\\"topP\\\":%f%P(),\\\"temp\\\":%f%P(),\\\"response_length\\\":%i%P(),\\\"remove_input\\\":%b%P()}\", [x.Context, x.TopP, x.Temperature, x.ResponseLength, x.RemoveInput]));\n
//}

//function eleutherReq(x, callback) {\n
//    const xhr = new XMLHttpRequest();\n
//    xhr.open(\"POST\", \"https://api.eleuther.ai/completion\");\n
//    xhr.setRequestHeader(\"User-Agent\", \"Mozilla/5.0 (X11; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0\");\n
//    xhr.setRequestHeader(\"Accept\", \"application/json\");\n
//    xhr.setRequestHeader(\"Accept-Language\", \"en-US,en;q=0.5\");\n
//    xhr.setRequestHeader(\"Referer\", \"https://6b.eleuther.ai/\");\n
//    xhr.setRequestHeader(\"Content-Type\", \"application/json\");\n
//    xhr.setRequestHeader(\"Origin\", \"https://6b.eleuther.ai\");\n
//    xhr.setRequestHeader(\"Connection\", \"keep-alive\");\n
//    xhr.setRequestHeader(\"Sec-Fetch-Dest\", \"empty\");\n
//    xhr.setRequestHeader(\"Sec-Fetch-Mode\", \"cors\");\n
//    xhr.setRequestHeader(\"Sec-Fetch-Site\", \"same-site\");\n
//    xhr.send(Object(_fable_fable_library_3_2_9_Option_js__WEBPACK_IMPORTED_MODULE_3__[\"some\"])(Request_stringify(x)));\n
//    xhr.onreadystatechange = (() => {\n
//        let json;\n
//        Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toConsole\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"printf\"])(\"asljfasd\"));\n
//        callback((xhr.readyState === 4) ? Object(_fable_fable_library_3_2_9_Option_js__WEBPACK_IMPORTED_MODULE_3__[\"some\"])((json = Object(_fable_FSharpPlus_1_2_2_Extensions_String_fs_js__WEBPACK_IMPORTED_MODULE_4__[\"trim\"])([\"[\", \"]\"], xhr.responseText), JSON.parse(json))) : (void 0));\n
//    });\n
//}

//function eleutherReqAsync(x) {\n
//return Object(_fable_fable_library_3_2_9_Async_js__WEBPACK_IMPORTED_MODULE_5__[\"fromContinuations\"])((tupledArg) => {\n
//        eleutherReq(x, tupledArg[0]);\n
//    });\n
//}

//function generatePrompt(ctx) {\n
//    return eleutherReqAsync(new Request_T(ctx, Object(_fable_fable_library_3_2_9_Decimal_js__WEBPACK_IMPORTED_MODULE_6__[\"fromParts\"])(9, 0, 0, false, 1), Object(_fable_fable_library_3_2_9_Decimal_js__WEBPACK_IMPORTED_MODULE_6__[\"fromParts\"])(8, 0, 0, false, 1), 128, false));\n
//}

//class PromptInfo extends _fable_fable_library_3_2_9_Types_js__WEBPACK_IMPORTED_MODULE_1__[\"Record\"] {\n
//    constructor(Id, Text$) {\n
//        super();\n
//        this.Id = (Id | 0);\n
//        this.Text = Text$;\n
//    }\n
//}

//function PromptInfo$reflection() {\n
//    return Object(_fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"record_type\"])(\"App.PromptInfo\", [], PromptInfo, () => [[\"Id\", _fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"int32_type\"]], [\"Text\", _fable_fable_library_3_2_9_Reflection_js__WEBPACK_IMPORTED_MODULE_2__[\"string_type\"]]]);\n
//}

//let promptCount = Object(_fable_fable_library_3_2_9_Util_js__WEBPACK_IMPORTED_MODULE_7__[\"createAtom\"])(0);

//function setPrompt(x, id) {\n
//    document.getElementById(\"promptDisplay\").innerText = x;\n
//    document.getElementById(\"txtBox\").setAttribute(\"active\", Object(_fable_fable_library_3_2_9_Types_js__WEBPACK_IMPORTED_MODULE_1__[\"toString\"])(id));\n
//}

//function generatePromptButton(num, idpref, x) {\n
//    const newel = document.createElement(\"li\");\n
//    newel.className = \"list-group-item\";\n
//    newel.id = Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toText\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"interpolate\"])(\"%P()prompt%P()\", [idpref, num]));\n
//    newel.setAttribute(\"style\", \"text-align: center;\");\n
//    const button = document.createElement(\"button\");\n
//    button.className = \"rounded bg-dark btn-outline-dark text-light\";\n
//    button.innerText = Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toText\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"interpolate\"])(\"Prompt %P()\", [num]));\n
//    button.onclick = ((_arg1) => {\n
//        setPrompt(x, num);\n
//    });\n
//    void newel.appendChild(button);\n
//    return newel;\n
//}

//function newPrompt() {\n
//    let x_16, objectArg;\n
//    document.getElementById(\"promptDisplay\").innerText = \"Loading...\";\n
//    promptCount(promptCount() + 1, true);\n
//    Object(_fable_fable_library_3_2_9_Async_js__WEBPACK_IMPORTED_MODULE_5__[\"startWithContinuations\"])((x_16 = Object(_fable_FSharpPlus_1_2_2_Extensions_Async_fs_js__WEBPACK_IMPORTED_MODULE_8__[\"map\"])((x_14) => generatePromptButton(promptCount(), \"generated\", x_14), Object(_fable_FSharpPlus_1_2_2_Extensions_Async_fs_js__WEBPACK_IMPORTED_MODULE_8__[\"map\"])((arg_2) => Object(_fable_FSharpPlus_1_2_2_Operators_fs_js__WEBPACK_IMPORTED_MODULE_9__[\"tap\"])((x_11) => {\n
//        setPrompt(x_11, promptCount());\n
//    }, Object(_fable_FSharpPlus_1_2_2_Extensions_Result_fs_js__WEBPACK_IMPORTED_MODULE_10__[\"get$\"])(Object(_fable_fable_library_3_2_9_Choice_js__WEBPACK_IMPORTED_MODULE_11__[\"Result_MapError\"])((x_10) => Object(_fable_FSharpPlus_1_2_2_Operators_fs_js__WEBPACK_IMPORTED_MODULE_9__[\"tap\"])((x_9) => {\n
//        Helpers_log(x_9);\n
//    }, x_10), Object(_fable_FSharpPlus_1_2_2_Extensions_Option_fs_js__WEBPACK_IMPORTED_MODULE_12__[\"toResultWith\"])(\"request failed\", arg_2)))), Object(_fable_FSharpPlus_1_2_2_Extensions_Async_fs_js__WEBPACK_IMPORTED_MODULE_8__[\"map\"])((option) => Object(_fable_fable_library_3_2_9_Option_js__WEBPACK_IMPORTED_MODULE_3__[\"map\"])((x_3) => (x_3[\"generated_text\"]), option), Object(_fable_FSharpPlus_1_2_2_Extensions_Async_fs_js__WEBPACK_IMPORTED_MODULE_8__[\"map\"])((x_1) => Object(_fable_FSharpPlus_1_2_2_Operators_fs_js__WEBPACK_IMPORTED_MODULE_9__[\"tap\"])((x) => {\n
//        console.log(Object(_fable_fable_library_3_2_9_Option_js__WEBPACK_IMPORTED_MODULE_3__[\"some\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toText\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"interpolate\"])(\"%P()\", [x]))));\n
//    }, x_1), eleutherReqAsync(new Request_T(document.getElementById(\"txtBox\").value, Object(_fable_fable_library_3_2_9_Decimal_js__WEBPACK_IMPORTED_MODULE_6__[\"fromParts\"])(9, 0, 0, false, 1), Object(_fable_fable_library_3_2_9_Decimal_js__WEBPACK_IMPORTED_MODULE_6__[\"fromParts\"])(8, 0, 0, false, 1), 128, false)))))), Object(_fable_FSharpPlus_1_2_2_Extensions_Async_fs_js__WEBPACK_IMPORTED_MODULE_8__[\"map\"])((objectArg = document.getElementById(\"generatedPromptList\"), (arg00) => objectArg.appendChild(arg00)), x_16)), (value) => {\n
//    }, (value_1) => {\n
//    }, (value_2) => {\n
//    });\n
//}

//function removePrompt() {\n
//    document.getElementById(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"toText\"])(Object(_fable_fable_library_3_2_9_String_js__WEBPACK_IMPORTED_MODULE_0__[\"interpolate\"])(\"generatedprompt%P()\", [document.getElementById(\"txtBox\").getAttribute(\"active\")]))).remove();\n
//}

//# sourceURL=webpack://fscode/./src/App.fs.js?");