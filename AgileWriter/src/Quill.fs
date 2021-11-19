// ts2fable 0.7.1
module rec Quill

open Fable.Core
open Fable.Core.JS
open Browser.Types

type Array<'T> = System.Collections.Generic.IList<'T>

type Blot = Object
type Delta = Object

[<AllowNullLiteral>]
type IExports =
    abstract Range : RangeStaticStatic
    abstract Quill : QuillStatic

[<AllowNullLiteral>]
type DeltaOperation =
    interface
    end

[<AllowNullLiteral>]
type SourceMap =
    abstract API : string with get, set
    abstract SILENT : string with get, set
    abstract USER : string with get, set

[<StringEnum>]
[<RequireQualifiedAccess>]
type Sources =
    | Api
    | User
    | Silent

[<AllowNullLiteral>]
type Key =
    abstract key : U2<string, float> with get, set
    abstract shortKey : bool option with get, set
    abstract shiftKey : bool option with get, set
    abstract altKey : bool option with get, set
    abstract metaKey : bool option with get, set
    abstract ctrlKey : bool option with get, set

[<AllowNullLiteral>]
type StringMap =
    [<Emit "$0[$1]{{=$2}}">]
    abstract Item : key: string -> obj option with get, set

[<AllowNullLiteral>]
type OptionalAttributes =
    abstract attributes : StringMap option with get, set

type TextChangeHandler = Delta * Delta * Sources -> unit

[<AllowNullLiteral>]
type SelectionChangeHandler =
    [<Emit "$0($1...)">]
    abstract Invoke : range: RangeStatic * oldRange: RangeStatic * source: Sources -> obj option

type EditorChangeHandler =
    U2<(Delta -> Delta -> Sources -> obj option), (RangeStatic -> RangeStatic -> Sources -> obj option)>

[<AllowNullLiteral>]
type KeyboardStatic =
    abstract addBinding : key: Key * callback: (RangeStatic -> obj option -> unit) -> unit
    abstract addBinding : key: Key * context: obj option * callback: (RangeStatic -> obj option -> unit) -> unit

[<AllowNullLiteral>]
type ClipboardMatcherCallback =
    [<Emit "$0($1...)">]
    abstract Invoke : node: obj option * delta: Delta -> Delta

type ClipboardMatcherNode = U2<string, float>

[<AllowNullLiteral>]
type ClipboardStatic =
    abstract matchers : Array<ClipboardMatcherNode * ClipboardMatcherCallback> with get, set
    abstract convert : ?content: ClipboardStaticConvertContent * ?formats: StringMap -> Delta
    abstract addMatcher : selectorOrNodeType: ClipboardMatcherNode * callback: ClipboardMatcherCallback -> unit
    abstract dangerouslyPasteHTML : html: string * ?source: Sources -> unit
    abstract dangerouslyPasteHTML : index: float * html: string * ?source: Sources -> unit

[<AllowNullLiteral>]
type ClipboardStaticConvertContent =
    abstract html : string option with get, set
    abstract text : string option with get, set

[<AllowNullLiteral>]
type QuillOptionsStatic =
    abstract debug : U2<string, bool> option with get, set
    abstract modules : StringMap option with get, set
    abstract placeholder : string option with get, set
    abstract readOnly : bool option with get, set
    abstract theme : string option with get, set
    abstract formats : ResizeArray<string> option with get, set
    abstract bounds : U2<HTMLElement, string> option with get, set
    abstract scrollingContainer : U2<HTMLElement, string> option with get, set
    abstract strict : bool option with get, set

[<AllowNullLiteral>]
type BoundsStatic =
    abstract bottom : float with get, set
    abstract left : float with get, set
    abstract right : float with get, set
    abstract top : float with get, set
    abstract height : float with get, set
    abstract width : float with get, set

[<AllowNullLiteral>]
type RangeStatic =
    abstract index : float with get, set
    abstract length : float with get, set

[<AllowNullLiteral>]
type RangeStaticStatic =
    [<Emit "new $0($1...)">]
    abstract Create : unit -> RangeStatic

[<AllowNullLiteral>]
type EventEmitter =
    [<Emit "$0.on('text-change',$1)">]
    abstract ``on_text-change`` : handler: TextChangeHandler -> EventEmitter

    [<Emit "$0.on('selection-change',$1)">]
    abstract ``on_selection-change`` : handler: SelectionChangeHandler -> EventEmitter

    [<Emit "$0.on('editor-change',$1)">]
    abstract ``on_editor-change`` : handler: EditorChangeHandler -> EventEmitter

    [<Emit "$0.once('text-change',$1)">]
    abstract ``once_text-change`` : handler: TextChangeHandler -> EventEmitter

    [<Emit "$0.once('selection-change',$1)">]
    abstract ``once_selection-change`` : handler: SelectionChangeHandler -> EventEmitter

    [<Emit "$0.once('editor-change',$1)">]
    abstract ``once_editor-change`` : handler: EditorChangeHandler -> EventEmitter

    [<Emit "$0.off('text-change',$1)">]
    abstract ``off_text-change`` : handler: TextChangeHandler -> EventEmitter

    [<Emit "$0.off('selection-change',$1)">]
    abstract ``off_selection-change`` : handler: SelectionChangeHandler -> EventEmitter

    [<Emit "$0.off('editor-change',$1)">]
    abstract ``off_editor-change`` : handler: EditorChangeHandler -> EventEmitter

[<AllowNullLiteral>]
type Quill =
    inherit EventEmitter
    /// Internal API
    abstract root : HTMLDivElement with get, set
    abstract clipboard : ClipboardStatic with get, set
    abstract scroll : Blot with get, set
    abstract keyboard : KeyboardStatic with get, set
    abstract deleteText : index: float * length: float * ?source: Sources -> Delta
    abstract disable : unit -> unit
    abstract enable : ?enabled: bool -> unit
    abstract isEnabled : unit -> bool
    abstract getContents : ?index: float * ?length: float -> Delta
    abstract getLength : unit -> float
    abstract getText : ?index: float * ?length: float -> string
    abstract insertEmbed : index: float * ``type``: string * value: obj option * ?source: Sources -> Delta
    abstract insertText : index: float * text: string * ?source: Sources -> Delta
    abstract insertText : index: float * text: string * format: string * value: obj option * ?source: Sources -> Delta
    abstract insertText : index: float * text: string * formats: StringMap * ?source: Sources -> Delta
    abstract pasteHTML : index: float * html: string * ?source: Sources -> string
    abstract pasteHTML : html: string * ?source: Sources -> string
    abstract setContents : delta: Delta * ?source: Sources -> Delta
    abstract setText : text: string * ?source: Sources -> Delta
    abstract update : ?source: Sources -> unit
    abstract updateContents : delta: Delta * ?source: Sources -> Delta
    abstract format : name: string * value: obj option * ?source: Sources -> Delta
    abstract formatLine : index: float * length: float * ?source: Sources -> Delta
    abstract formatLine : index: float * length: float * format: string * value: obj option * ?source: Sources -> Delta
    abstract formatLine : index: float * length: float * formats: StringMap * ?source: Sources -> Delta
    abstract formatText : index: float * length: float * ?source: Sources -> Delta
    abstract formatText : index: float * length: float * format: string * value: obj option * ?source: Sources -> Delta
    abstract formatText : index: float * length: float * formats: StringMap * ?source: Sources -> Delta
    abstract formatText : range: RangeStatic * format: string * value: obj option * ?source: Sources -> Delta
    abstract formatText : range: RangeStatic * formats: StringMap * ?source: Sources -> Delta
    abstract getFormat : ?range: RangeStatic -> StringMap
    abstract getFormat : index: float * ?length: float -> StringMap
    abstract removeFormat : index: float * length: float * ?source: Sources -> Delta
    abstract blur : unit -> unit
    abstract focus : unit -> unit
    abstract getBounds : index: float * ?length: float -> BoundsStatic
    abstract getSelection : focus: obj -> RangeStatic
    abstract getSelection : ?focus: obj -> RangeStatic option
    abstract hasFocus : unit -> bool
    abstract setSelection : index: float * length: float * ?source: Sources -> unit
    abstract setSelection : range: RangeStatic * ?source: Sources -> unit
    abstract addContainer : classNameOrDomNode: U2<string, Node> * ?refNode: Node -> obj option
    abstract getModule : name: string -> obj option
    abstract getIndex : blot: obj option -> float
    abstract getLeaf : index: float -> obj option
    abstract getLine : index: float -> obj option * float
    abstract getLines : ?index: float * ?length: float -> ResizeArray<obj option>
    abstract getLines : range: RangeStatic -> ResizeArray<obj option>

    [<Emit "$0.on('text-change',$1)">]
    abstract ``on_text-change`` : handler: TextChangeHandler -> EventEmitter

    [<Emit "$0.on('selection-change',$1)">]
    abstract ``on_selection-change`` : handler: SelectionChangeHandler -> EventEmitter

    [<Emit "$0.on('editor-change',$1)">]
    abstract ``on_editor-change`` : handler: EditorChangeHandler -> EventEmitter

    [<Emit "$0.once('text-change',$1)">]
    abstract ``once_text-change`` : handler: TextChangeHandler -> EventEmitter

    [<Emit "$0.once('selection-change',$1)">]
    abstract ``once_selection-change`` : handler: SelectionChangeHandler -> EventEmitter

    [<Emit "$0.once('editor-change',$1)">]
    abstract ``once_editor-change`` : handler: EditorChangeHandler -> EventEmitter

    [<Emit "$0.off('text-change',$1)">]
    abstract ``off_text-change`` : handler: TextChangeHandler -> EventEmitter

    [<Emit "$0.off('selection-change',$1)">]
    abstract ``off_selection-change`` : handler: SelectionChangeHandler -> EventEmitter

    [<Emit "$0.off('editor-change',$1)">]
    abstract ``off_editor-change`` : handler: EditorChangeHandler -> EventEmitter

[<AllowNullLiteral>]
type QuillStatic =
    [<Emit "new $0($1...)">]
    abstract Create : container: U2<string, Element> * ?options: QuillOptionsStatic -> Quill

    abstract sources : SourceMap
    abstract debug : level: U2<string, bool> -> unit
    abstract import : path: string -> obj option
    abstract register : path: string * def: obj option * ?suppressWarning: bool -> unit
    abstract register : defs: StringMap * ?suppressWarning: bool -> unit
    abstract find : domNode: Node * ?bubble: bool -> U2<Quill, obj option>
