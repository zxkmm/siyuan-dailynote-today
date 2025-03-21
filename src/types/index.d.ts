interface Window {
    siyuan: {
        config: any;
        notebooks: any;
        menus: any;
        dialogs: any;
        blockPanels: any;
        storage: any;
        user: any;
        ws: any;
        languages: any;
    };
    Lute: any;
}


type DocumentId = string;
type BlockId = string;
type NotebookId = string;
type PreviousID = BlockId;
type ParentID = BlockId | DocumentId;

type markdown = string;

type TDuplicateHandleMethod = 'DeleteDup' | 'AllMerge' | 'SmartMerge' | 'TrashDup' | 'None';

type ResvBlock = Block;
type ResvBlockIds = BlockId[];

type RetvPosition = 'top' | 'bottom';
type RetvType = 'embed' | 'link' | 'ref';
type RetvBlockContent = markdown;
type RetvBlock = Block;

type IconPosition = 'left' | 'right';

type Second = number;
type Milisecond = number;

type Reservation = {
    id: BlockId;
    content: string;
    date: string;
}

type Notebook = {
    id: NotebookId;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
    dailyNoteDocId?: DocumentId;
    dailynoteSprig?: string;
    dailynoteHpath?: string;
}

type NotebookConf = {
    name: string;
    closed: boolean;
    refCreateSavePath: string;
    createDocNameTemplate: string;
    dailyNoteSavePath: string;
    dailyNoteTemplatePath: string;
}

type BlockType = "d" | "s" | "h" | "t" | "i" | "p" | "f" | "audio" | "video" | "other";

type BlockSubType = "d1" | "d2" | "s1" | "s2" | "s3" | "t1" | "t2" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "table" | "task" | "toggle" | "latex" | "quote" | "html" | "code" | "footnote" | "cite" | "collection" | "bookmark" | "attachment" | "comment" | "mindmap" | "spreadsheet" | "calendar" | "image" | "audio" | "video" | "other";

type Block = {
    id: BlockId;
    parent_id?: BlockId;
    root_id: DocumentId;
    hash: string;
    box: string;
    path: string;
    hpath: string;
    name: string;
    alias: string;
    memo: string;
    tag: string;
    content: string;
    fcontent?: string;
    markdown: string;
    length: number;
    type: BlockType;
    subtype: BlockSubType;
    ial?: { [key: string]: string };
    sort: number;
    created: string;
    updated: string;
}

type DocBlock = Block & {
    type: 'd'
}

type doOperation = {
    action: string;
    data: string;
    id: BlockId;
    parentID: BlockId | DocumentId;
    previousID: BlockId;
    retData: null;
}

type SettingKey =
    // App behavior settings
    | 'OpenOnStart'
    // | 'AutoOpenAfterSync'
    | 'DisableAutoCreateOnMobile'

    // Notebook settings
    | 'DefaultNotebook'
    | 'NotebookBlacklist'

    // UI settings
    | 'IconPosition'
    | 'ExpandGutterMenu'
    | 'PopupReserveDialog'
    | 'HighlightResv'

    // Feature toggles
    | 'EnableMove'
    | 'EnableReserve'
    | 'EnableResvDock'

    // Reservation settings
    | 'ResvEmbedAt'
    | 'RetvType'

    // System settings
    | 'PluginVersion'
    | 'ReplaceAlt5Hotkey'
    | 'AutoHandleDuplicateMethod';

// interface ISettingItem {
//     type: string;
//     key: string;
//     value: any;
//     content: any;
// }

interface ITreeStat {
    imageCount: number;
    linkCount: number;
    refCount: number;
    runeCount: number;
    wordCount: number;
}
