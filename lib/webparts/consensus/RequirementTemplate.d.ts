import { ISPRequirement, ISPScores, ISPVendor } from "./consensus-entities";
export default class RequirementTemplate {
    private static _createVendorHeaderHtml;
    private static _createItemHeaderHtml;
    private static _createScoreDetailsHtml;
    private static _createRequirementHtml;
    static getRequirementHtml(vendors: ISPVendor[], items: ISPRequirement[], scores: ISPScores[], comments: ISPScores[], webUrl: string): string;
}
//# sourceMappingURL=RequirementTemplate.d.ts.map