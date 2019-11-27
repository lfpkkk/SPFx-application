import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration } from '@microsoft/sp-webpart-base';
import 'jqueryui';
export interface IConsensusWebPartProps {
    description: string;
}
export default class ConsensusWebPart extends BaseClientSideWebPart<IConsensusWebPartProps> {
    constructor();
    private _vendorId;
    private _getQryStringValues;
    render(): void;
    private _isFullAccess;
    private _isReadOnly;
    private _checkPermissions;
    private _LoggedInUserId;
    private consensusService;
    private _renderListAsync;
    private _vendors;
    private _onVendorsFetched;
    private _scores;
    private _afterScoresFetched;
    private _scoreWeightings;
    private onWeightsFetched;
    private _requirements;
    private _onRequirementsFetched;
    private _comments;
    private _onCommentsFetched;
    private _renderRequirementList;
    private _onReadOnly;
    private _addEventHandler;
    private _showConsensusEventHandler;
    private _assignPrintView;
    readonly _date: string;
    private _getPrintViewFormatted;
    protected readonly dataVersion: Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=ConsensusWebPart.d.ts.map