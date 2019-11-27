import { ISPVendorsList, ISPRequirementList, ISPScoresList, ISPScoreWeightingsList } from './consensus-entities';
export default class ConsensusService {
    private context;
    private web;
    constructor(context: any);
    getUserGroups(): Promise<string[]>;
    getLoggedInUserId(): Promise<any>;
    getVendors(): Promise<ISPVendorsList>;
    getRequirements(): Promise<ISPRequirementList>;
    getScores(): Promise<ISPScoresList>;
    getComments(): Promise<ISPScoresList>;
    getScoreWeightings(): Promise<ISPScoreWeightingsList>;
    private _showSuccessMsg;
    saveConsensusScoreDetails(reqNumber: any, vendorId: any, consensusScore: any, consensusComment: any, enteredBy: any): void;
    static _hideOnStartUp(): void;
}
//# sourceMappingURL=consensus-service.d.ts.map