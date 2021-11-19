module App

open Browser.Types
open Browser
open Fable.Core.JsInterop
open Fable.Core.DynamicExtensions

module Async =
    let map f op = async {
        let! x    = op
        let value = f x
        return value
    }

let tap f x = f x; x
let resultGet x = 
    match x with
    | Ok x -> x
    | Error _ -> failwith "was none"

let optionOfResult x = 
    match x with
    | Ok x -> Some x
    | Error _ -> None
    
let optionToResultWith e x =
    match x with
    | Some x -> Ok x
    | None -> Error e

let stringTrim (trimChars: char seq) (source: string) = source.Trim (Seq.toArray trimChars)

module Helpers =
    let log x = printfn $"###{x}"
    let inline resLog x = x |> Result.mapError (tap log)
    let inline logUnwrap x = x |> (resLog >> resultGet)
    let inline logChoose x = x |> (resLog >> optionOfResult)

open Helpers

type EleutherRequest =
    Fable.JsonProvider.Generator<"""{"context":"test_string","topP":0.9,"temp":0.8,"response_length":128,"remove_input":true}""">

type EleutherResponse =
    Fable.JsonProvider.Generator<"""{"generated_text":"Hello there!\n\nHi, welcome to my blog. I'm a 20-something living in Melbourne and I have a huge passion for all things health, fitness, food and travel. I hope you enjoy reading my posts and find them helpful in some way!"}""">

module Request =
    type T =
        { Context: string
          TopP: decimal
          Temperature: decimal
          ResponseLength: int
          RemoveInput: bool }

    let stringify x =
        $"{{\"context\":\"%s{x.Context}\",\"topP\":%f{x.TopP},\"temp\":%f{x.Temperature},\"response_length\":%i{x.ResponseLength},\"remove_input\":%b{x.RemoveInput}}}"

let eleutherReq x callback =
    let url = "https://api.eleuther.ai/completion"

    let xhr =
        Browser.XMLHttpRequest.XMLHttpRequest.Create()

    xhr.``open`` ("POST", url)

    xhr.setRequestHeader ("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0")
    xhr.setRequestHeader ("Accept", "application/json")
    xhr.setRequestHeader ("Accept-Language", "en-US,en;q=0.5")
    xhr.setRequestHeader ("Referer", "https://6b.eleuther.ai/")
    xhr.setRequestHeader ("Content-Type", "application/json")
    xhr.setRequestHeader ("Origin", "https://6b.eleuther.ai")
    xhr.setRequestHeader ("Connection", "keep-alive")
    xhr.setRequestHeader ("Sec-Fetch-Dest", "empty")
    xhr.setRequestHeader ("Sec-Fetch-Mode", "cors")
    xhr.setRequestHeader ("Sec-Fetch-Site", "same-site")


    let data = Request.stringify x

    xhr.send (data)

    xhr.onreadystatechange <-
        (fun () ->
            match xhr.readyState with
            | ReadyState.Done ->
                Some
                <| (EleutherResponse(xhr.responseText |> stringTrim [ '['; ']' ]))
            | _ -> None
            |> callback)

let eleutherReqAsync x =
    Async.FromContinuations(fun (succ, _, _) -> eleutherReq x succ)


let generatePrompt ctx =
    eleutherReqAsync (
        { Context = ctx
          TopP = 0.9M
          Temperature = 0.8M
          ResponseLength = 128
          RemoveInput = false }
    )

let generatePromptNoInput (ctx: string) =
    eleutherReqAsync (
        { Context = ctx.Replace("\n","\\n")
          TopP = 0.9M
          Temperature = 0.8M
          ResponseLength = 128
          RemoveInput = true }
    )

type PromptInfo = { Id: int; Text: string }

let mutable promptCount = 0

let setPrompt x id =
    document.getElementById("promptDisplay").innerText <- x

    document
        .getElementById("txtBox")
        .setAttribute ("active", id |> string)

let generatePromptButton num idpref x =
    let newel = document.createElement ("li")
    newel.className <- "list-group-item"
    newel.id <- $"{idpref}prompt{num}"
    newel.setAttribute ("style", "text-align: center;")
    let button = document.createElement ("button")
    button.className <- "rounded bg-dark btn-outline-dark text-light"
    button.innerText <- $"Prompt {num}"
    button.onclick <- (fun _ -> setPrompt x num)
    newel.appendChild (button) |> ignore
    newel

(*
                                <li class="list-group-item" style="text-align: center;">
                                <button class="rounded bg-dark btn-outline-dark text-light">Prompt 1</button>
                            </li>*)

let newPrompt () =
    document.getElementById("promptDisplay").innerText <- "Loading..."
    promptCount <- promptCount + 1

    eleutherReqAsync (
        { Context =
            (document.getElementById ("txtBox") :?> HTMLInputElement)
                .value
          TopP = 0.9M
          Temperature = 0.8M
          ResponseLength = 128
          RemoveInput = false }
    )
    |> Async.map (tap (fun x -> console.log ($"{x}")))
    |> Async.map (Option.map (fun x -> x.generated_text))
    |> Async.map (
        optionToResultWith "request failed"
        >> logUnwrap
        >> tap (fun x -> setPrompt x promptCount)
    )
    |> Async.map (generatePromptButton promptCount "generated")
    |> Async.map (
        document
            .getElementById(
                "generatedPromptList"
            )
            .appendChild
    )
    |> (fun x -> Async.StartWithContinuations(x, ignore, ignore, ignore))

let removePrompt () =
    //promptCount <- promptCount - 1

    let active =
        document
            .getElementById("txtBox")
            .getAttribute ("active")

    document
        .getElementById($"generatedprompt{active}")
        .remove ()

open Quill
open Fable.Core

// <div class="autocomplete-container" style="position: absolute; visibility: visible; top: 184.594px; left: 165px;">
//    <ul class="autocomplete-list">
//       <li class="autocomplete-item selected" data-index="0" data-denotation-char="" data-id=" ." data-value=" ."> .</li>
//       <li class="ql-mention-list-item" data-index="1" data-denotation-char="" data-id=" j
//          You" data-value=" j
//          You"> j↵You</li>
//    </ul>
// </div>

module Autocomplete =
    open CaretPos

    type AutocompleteItem = string * string

    let makeAutoCompleteBox top left list =
        let container = document.createElement("div")
        container.className <- "autocomplete-container"
        container.setAttribute("style", $"position: absolute; visibility: visible; top: {top}px; left: {left}px;")
        let listE = document.createElement("ul")
        listE.className <- "autocomplete-list"
        listE.id <- "autocomplete-list"
        list |> List.mapi (fun i x ->
            let li = document.createElement("li")
            if i = 0 then
                li.className <- "autocomplete-item selected"
            else
                li.className <- "autocomplete-item"
            li.setAttribute("data-value", x)
            li.id <- $"autocomplete-item{i}"
            li.innerText <- x.Replace("\n", "↵")
            li
        ) |> List.map (fun x -> listE.appendChild(x) |> ignore)
        |> ignore
        container.appendChild(listE) |> ignore
        container

    let attachQuill (x: Quill) =
        let mutable runningGen = false
        let mutable box = makeAutoCompleteBox 0 0 ["Test value 1";"Test value\n2"]
        
        box?style?visibility <- "hidden"

        document.body.appendChild(box) |> ignore

        let resize () =
            let caret = CaretPos.offset(element = x.root, ?settings = None)
            box?style?left <- $"{caret.left}px"
            box?style?top <- $"{caret.top - caret.height + 32.0}px"
            console.log(caret)

        // let filterOut txt =
        //         let children = (document.getElementById("autocomplete-list")).children
        //         for i in 0..children.length - 1 do
        //             let childText = children.[i].getAttribute("data-value")
        //             let newVal = if txt |> Seq.last = (childText |> Seq.head) then Seq.tail childText |> System.String.Concat else ""
        //             children.[i].setAttribute("data-value", newVal)
        //             children.[i].innerHTML <- newVal.Replace("\n", "↵")
        //         ()

        x.``on_text-change`` (fun _ ->
            if box?style?visibility = "visible" then resize()
            // filterOut (x.getText())
            ()
        ) |> ignore
        window.addEventListener("resize", fun _ ->
            if box?style?visibility = "visible" then resize()
            ()
        )

        x.keyboard.addBinding(key = !!{|key = "up"; ctrlKey = Some true|},
            callback = (fun _ _ ->
                if not runningGen then 
                    printfn "up"
                    let children = (document.getElementById("autocomplete-list")).children
                    let mutable setter = true
                    for i in 0..children.length - 1 do
                        if children.[i].getAttribute("class") = "autocomplete-item selected" && setter then
                            children.[i].setAttribute("class", "autocomplete-item")
                            let bound = max(i - 1) 0
                            children.[bound].setAttribute("class", "autocomplete-item selected")
                            setter <- false
                    ()
            )
        )

        x.keyboard.addBinding(key = !!{|key = "down"; ctrlKey = Some true|},
            callback = (fun _ _ ->
                if not runningGen then 
                    printfn "down"
                    let children = (document.getElementById("autocomplete-list")).children
                    let mutable setter = true
                    for i in 0..children.length - 1 do
                        if children.[i].getAttribute("class") = "autocomplete-item selected" && setter then
                            children.[i].setAttribute("class", "autocomplete-item")
                            let bound = min(i + 1) (children.length - 1)
                            children.[bound].setAttribute("class", "autocomplete-item selected")
                            setter <- false
                    ()
            )
        )
        x.keyboard?bindings.["13"]?unshift(
            !!{|key = "enter"; ctrlKey = true; altKey = false; handler = (fun range _ ->
                if not runningGen then 
                    if box?style?visibility = "visible" then
                        let children = (document.getElementById("autocomplete-list")).children
                        for i in 0..children.length - 1 do
                            let elem = document.getElementById($"autocomplete-item{i}")
                            if elem.className = "autocomplete-item selected" then
                                x.insertText(range?index, elem.getAttribute("data-value")) |> ignore
                                box?style?visibility <- "hidden"
            )|}
        )

        x.keyboard.addBinding(key = !!{|key = "g"; ctrlKey = Some true|},
            callback = (fun _ _ ->
               if not runningGen then
                    runningGen <- true
                    box <- makeAutoCompleteBox 0 0 ["..."]
                    document.getElementsByClassName("autocomplete-container").[0].remove()
                    document.body.appendChild(box) |> ignore
                    resize()
                    generatePromptNoInput (x.getText())
                    |> Async.map(fun x ->
                        match x with
                        | Some x -> x.generated_text
                        | None -> console.log(x); ""
                    )
                    |> Async.map(fun x ->
                        box <- makeAutoCompleteBox 0 0 [x]
                        document.getElementsByClassName("autocomplete-container").[0].remove()
                        document.body.appendChild(box) |> ignore
                        resize()
                    )
                    |> Async.map(fun _ ->
                        runningGen <- false
                    )
                    |> Async.StartAsPromise
                    |> ignore
                else
                    printfn "already running"
            )
        )

let editor: Quill = window?editor

let attachme () =
    Autocomplete.attachQuill editor |> ignore

// editor.``once_editor-change`` (U2.Case1 (fun _ _ _ ->
//     attachme ()
//     Some (upcast ())
// )) |> ignore

window.addEventListener("load", fun _ ->
    attachme ()
) |> ignore