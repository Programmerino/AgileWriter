// ts2fable 0.7.1
module rec CaretPos
open System
open Fable.Core
open Fable.Core.JS
open Browser.Types


type [<AllowNullLiteral>] IExports =
    /// Gets or sets the position. Pass value to set, omit to get.
    abstract position: element: Element * ?settings: CaretPositionSettings -> Pos
    abstract position: element: Element * ?value: float * ?settings: CaretPositionSettings -> Pos
    /// Gets or sets the offset. Pass value to set, omit to get.
    abstract offset: element: Element * ?settings: CaretPositionSettings -> Offset
    abstract offset: element: Element * ?value: float * ?settings: CaretPositionSettings -> Offset
    /// Use to get the offset of an iframe to position things correctly
    abstract getOffset: element: Element * ?ctx: GetOffsetCtx -> GetOffsetReturn

type [<AllowNullLiteral>] GetOffsetCtx =
    abstract window: Window with get, set
    abstract document: Document with get, set

type [<AllowNullLiteral>] GetOffsetReturn =
    abstract top: float with get, set
    abstract left: float with get, set

type [<AllowNullLiteral>] CaretPositionSettings =
    /// When getting the offset, in certain cases a "shadow caret" is temporarily created and destroyed
    /// to facilitate calculations. If one does not wish to mutate the DOM in this way, one can include
    /// the noShadowCaret option in the offset
    /// 
    /// Note that doing this might make the offset calculation less accurate in some edge cases.
    abstract noShadowCaret: bool option with get, set
    /// Passing the customPos option allows specifying a custom cursor position in the element
    /// when getting the offset. This will not change the position, but calculate the offset from
    /// the custom position rather than the current one. This works for both contentEditable and textarea.
    abstract customPos: float option with get, set
    /// In order to get the correct values for an iframe, we need to pass it in the settings so that
    /// it can get a reference to the iframe.
    abstract iframe: HTMLIFrameElement option with get, set

type [<AllowNullLiteral>] Pos =
    abstract left: float with get, set
    abstract top: float with get, set
    abstract height: float with get, set
    abstract pos: float with get, set

type [<AllowNullLiteral>] Offset =
    abstract left: float with get, set
    abstract top: float with get, set
    abstract height: float with get, set

[<Import("*", "caret-pos")>]
let CaretPos: IExports = jsNative