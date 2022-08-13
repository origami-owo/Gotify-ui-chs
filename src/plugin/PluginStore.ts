import axios from 'axios';
import {action} from 'mobx';
import {BaseStore} from '../common/BaseStore';
import * as config from '../config';
import {SnackReporter} from '../snack/SnackManager';
import {IPlugin} from '../types';

export class PluginStore extends BaseStore<IPlugin> {
    public onDelete: () => void = () => {};

    public constructor(private readonly snack: SnackReporter) {
        super();
    }

    public requestConfig = (id: number): Promise<string> =>
        axios.get(`${config.get('url')}plugin/${id}/config`).then((response) => response.data);

    public requestDisplay = (id: number): Promise<string> =>
        axios.get(`${config.get('url')}plugin/${id}/display`).then((response) => response.data);

    protected requestItems = (): Promise<IPlugin[]> =>
        axios.get<IPlugin[]>(`${config.get('url')}plugin`).then((response) => response.data);

    protected requestDelete = (): Promise<void> => {
        this.snack('无法删除插件');
        throw new Error('无法删除插件');
    };

    public getName = (id: number): string => {
        const plugin = this.getByIDOrUndefined(id);
        return id === -1 ? '所有插件' : plugin !== undefined ? plugin.name : '未知';
    };

    @action
    public changeConfig = async (id: number, newConfig: string): Promise<void> => {
        await axios.post(`${config.get('url')}plugin/${id}/config`, newConfig, {
            headers: {'content-type': 'application/x-yaml'},
        });
        this.snack(`插件配置已更新`);
        await this.refresh();
    };

    @action
    public changeEnabledState = async (id: number, enabled: boolean): Promise<void> => {
        await axios.post(`${config.get('url')}plugin/${id}/${enabled ? 'enable' : 'disable'}`);
        this.snack(`插件 ${enabled ? '启用' : '禁用'}`);
        await this.refresh();
    };
}
