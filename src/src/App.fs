module App

type EleutherRequest = Fable.JsonProvider.Generator<"""{"context":"test_string","topP":0.9,"temp":0.8,"response_length":128,"remove_input":true}""">

let eleutherReq (x: EleutherRequest) =
    let url = "https://api.eleuther.ai/completion"

    let xhr = Browser.XMLHttpRequest.XMLHttpRequest.Create()
    xhr.``open``("POST", url)

    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.setRequestHeader("Accept-Language", "en-US,en;q=0.5")
    xhr.setRequestHeader("Referer", "https://6b.eleuther.ai/")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Origin", "https://6b.eleuther.ai")
    xhr.setRequestHeader("Connection", "keep-alive") 
    xhr.setRequestHeader("Sec-Fetch-Dest", "empty")
    xhr.setRequestHeader("Sec-Fetch-Mode", "cors")
    xhr.setRequestHeader("Sec-Fetch-Site", "same-site")
     

    let data = """{"context":"I think that ","topP":0.9,"temp":0.8,"response_length":128,"remove_input":true}"""

    xhr.send(data)

let sampleReq () = eleutherReq (EleutherRequest("""{"context":"I think that ","topP":0.9,"temp":0.8,"response_length":128,"remove_input":true}"""))