/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Menu } from "siyuan";
import { moveBlocksToDailyNote, compareVersion } from "../func";
import { i18n, info } from "../utils";
import notebooks from "../global-notebooks";
import { eventBus } from "../event-bus";
import * as serverApi from '../serverApi';

//右键菜单的监听器
let gutterContextMenuEvent: EventListenerOrEventListenerObject;

export class ContextMenu {

    private observer: MutationObserver | null = null;

    constructor() {
        gutterContextMenuEvent = (event: MouseEvent) => { this.gutterContextMenuEvent(event) }
    }

    bindMenuOnCurrentTabs() {
        //每个 Tab 标签页都绑定了一个 gutter
        let gutters: NodeListOf<Element> = document.querySelectorAll('div.protyle-gutters');
        info(`监听当前的 ${gutters.length} 个 Tab 标签上的 gutter`);
        for (let g of gutters) {
            info(`监听 Tab ${g.parentElement?.getAttribute('data-id')}`);
            g.addEventListener('contextmenu', gutterContextMenuEvent);
        }
    }

    releaseMenuOnCurrentTabs() {
        let gutters: NodeListOf<Element> = document.querySelectorAll('div.protyle-gutters');
        info(`解除监听当前的 ${gutters.length} 个 Tab 标签上的 gutter`);
        for (let g of gutters) {
            info(`解除对 ${g.parentElement?.getAttribute('data-id')} 的监听`);
            g.removeEventListener('contextmenu', gutterContextMenuEvent);
        }
    }


    addEditorTabObserver() {
        info(`开始对 Tab 标签变化的监听`);
        let centerLayout = document.querySelector('#layouts div.layout__center div.layout-tab-container') as HTMLElement;
        let gutterContextMenuEvent = (event: MouseEvent) => { this.gutterContextMenuEvent(event) };
        this.observer = new MutationObserver(function (mutationsList) {
            info(`监听到标签页发生变化:`);
            console.log(mutationsList);
            for (var mutation of mutationsList) {
                if (mutation.type == 'childList' && mutation.addedNodes.length) {
                    for (let node of mutation.addedNodes) {
                        let protyle: HTMLElement = node as HTMLElement;
                        let gutter: HTMLDivElement | null = protyle.querySelector(
                            'div.protyle-gutters'
                        );
                        gutter?.addEventListener('contextmenu', gutterContextMenuEvent);
                        let data_id = protyle.getAttribute('data-id');
                        info(`Add Listener: protyle-${data_id}`);
                    }
                }
                if (mutation.type == 'childList' && mutation.removedNodes.length) {
                    //删除 Listener
                    for (let node of mutation.removedNodes) {
                        let protyle: HTMLElement = node as HTMLElement;
                        let gutter: HTMLDivElement | null = protyle.querySelector(
                            'div.protyle-gutters'
                        );
                        gutter?.removeEventListener('contextmenu', gutterContextMenuEvent);
                        let data_id = protyle.getAttribute('data-id');
                        info(`Del Listener: protyle-${data_id}`);
                    }
                }
            }
        });
        if (centerLayout) {
            this.observer.observe(centerLayout!, {
                childList: true,
                attributes: false,
                characterData: false,
                subtree: false
            });
        }
    }

    removeEditorTabObserver() {
        info(`停止对 Tab 标签变化的监听`);
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    gutterContextMenuEvent(event: MouseEvent) {
        let src_ele = event.target as HTMLElement;
        let tar_ele = event.currentTarget as HTMLElement;

        //找到最近的 btn，因为只有 btn 才有 data-node-id
        while (src_ele != tar_ele) {
            if (src_ele.tagName === 'BUTTON') {
                break;
            }
            if (src_ele.parentElement) {
                src_ele = src_ele.parentElement;
            } else {
                break;
            }
        }
        let data_id = src_ele.getAttribute('data-node-id');

        if (data_id && event.altKey) {
            info(`Contextemnu on: ${data_id}`);
            let menu = new Menu('MoveMenu');
            menu.addItem({
                label: i18n.MoveMenu.Move,
                type: 'submenu',
                icon: 'iconMove',
                submenu: this.createMenuItems(data_id),
            });
            // console.log(event);
            menu.open({
                x: event.x,
                y: event.y
            })
        }
        event.stopPropagation();
    }

    createMenuItems(data_id: string) {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item = {
                label: notebook.name,
                icon: `icon-${notebook.icon}`,
                click: async () => {
                    info(`Move ${data_id} to ${notebook.id}`);
                    await moveBlocksToDailyNote(data_id, notebook);
                    eventBus.publish('moveBlocks', '');
                }
            }
            menuItems.push(item);
        }
        return menuItems;
    }
}