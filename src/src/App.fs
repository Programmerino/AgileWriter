module App

open Browser.Types
open Browser
open FSharpPlus

module Helpers =
    let log x = printfn $"###{x}"
    let inline resLog x = x |> Result.mapError (tap log)
    let inline logUnwrap x = x |> (resLog >> Result.get)
    let inline logChoose x = x |> (resLog >> Option.ofResult)

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
            printfn "asljfasd"

            match xhr.readyState with
            | ReadyState.Done ->
                Some
                <| (EleutherResponse(xhr.responseText |> String.trim [ '['; ']' ]))
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
              (document.getElementById("txtBox") :?> HTMLInputElement)
                  .value
          TopP = 0.9M
          Temperature = 0.8M
          ResponseLength = 128
          RemoveInput = false }
    )
    |> Async.map (tap (fun x -> console.log ($"{x}")))
    |> Async.map (Option.map(fun x -> x.generated_text))
    |> Async.map (
        Option.toResultWith "request failed"
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