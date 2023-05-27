/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin } from 'siyuan';
import { info, error } from './utils';
import { eventBus } from './event-bus';


// type NotebookSorting = 'doc-tree' | 'custom-sort'
type IconPosition = 'left' | 'right';
type SettingKey = (
    'OpenOnStart' | 'DefaultNotebook' | 'IconPosition' |
    'DiaryUpToDate' | 'PluginVersion' | "EnableMove"
);

interface Item {
    key: SettingKey,
    value: any
}

const SettingFile = 'DailyNoteToday.json.txt';

class SettingManager {
    plugin: Plugin;

    settings: any = {
        OpenOnStart: true as boolean, //启动的时候自动打开日记
        DiaryUpToDate: true as boolean, //自动更新日记的日期
        // NotebookSort: 'doc-tree' as NotebookSorting, //笔记本排序方式
        DefaultNotebook: '', //默认笔记本的 ID
        IconPosition: 'left' as IconPosition, //图标放置位置
        PluginVersion: '',
        EnableMove: false as boolean
    };

    constructor() {
        eventBus.subscribe(eventBus.EventSetting, (data: Item) => {
            this.set(data.key, data.value);
            this.save();
        });
    }

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key: SettingKey) {
        return this.settings?.[key];
    }

    set(key: any, value: any) {
        // info(`Setting update: ${key} = ${value}`)
        if (!(key in this.settings)) {
            error(`"${key}" is not a setting`);
            return;
        }

        this.settings[key] = value;
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        let loaded = await this.plugin.loadData(SettingFile);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            info(`没有配置文件，使用默认配置`)
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            info(`读入配置文件: ${SettingFile}`)
            console.log(loaded);
            //Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            //为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }
            try {
                for (let key in loaded) {
                    this.set(key, loaded[key]);
                }
            } catch (error_msg) {
                error(`Setting load error: ${error_msg}`);
            }
            this.save();
        }
    }

    async save() {
        let json = JSON.stringify(this.settings);
        info(`写入配置文件: ${json}`);
        this.plugin.saveData(SettingFile, json);
    }
}

export const settings: SettingManager = new SettingManager();

const ReserveFile = 'Reservation.json';

class ReservationManger {
    plugin: Plugin;

    reservations: { [date: string]: string[]} = {};

    private dateTemplate(date: Date) {
        return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
    }

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    save() {
        let json = JSON.stringify(this.reservations);
        info(`写入预约文件: ${json}`);
        this.plugin.saveData(ReserveFile, json);
    }

    //添加预约
    doReserve(date: Date, blockId: string) {
        // YYYYMMDD
        let date_str = this.dateTemplate(date);
        if (!(date_str in this.reservations)) {
            this.reservations[date_str] = [];
        }
        this.reservations[date_str].push(blockId);
    }

    //获取今天的预约
    getTodayReservations(): string[] {
        let date = new Date();
        let date_str = this.dateTemplate(date);
        return this.reservations[date_str] || [];
    }

    //清理已经过期的预约
    doPurgeExpired() {
        let date = new Date();
        let date_str = this.dateTemplate(date);
        for (let key in this.reservations) {
            if (key < date_str) {
                delete this.reservations[key];
            }
        }
    }
}

export const reservation: ReservationManger = new ReservationManger();

