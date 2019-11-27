import { ISPRequirementList, ISPScoresList } from "./consensus-entities";
export default class MockConsensusHttpClient {
    private static _items;
    getRequirements(): Promise<ISPRequirementList>;
    private static _scores;
    getScoresForRequirementNum(reqNum: any, vendorId: any): Promise<ISPScoresList>;
    getScoresForVendorId(vendorId: any): Promise<ISPScoresList>;
}
//# sourceMappingURL=MockConsensusHttpClient.d.ts.map