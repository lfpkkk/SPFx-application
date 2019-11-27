import { ISPRequirement, ISPScores, ScoreType, ISPVendor, ISPScoreWeightings } from "./consensus-entities";
import styles from './ConsensusWebPart.module.scss';


export default class RequirementTemplate {

    private static _createVendorHeaderHtml(item: ISPVendor, consensusScr:number, weightedScore:number, status:string): string {
        //if not completed then pass null in score
        let consensusScoreTxt = (consensusScr) ? `Consensus score: <b>${consensusScr}</b> (${weightedScore.toFixed(2)}%)` : status;
        let html =
            `<h2 class="${styles.categoryHeader}" vendorId="${item.ID}">
                <span>${item.Alias}</span>
                <span name="vendorConsensusScore" class="${styles.consensusScore}">${consensusScoreTxt}</span>
            </h2>`;

        return html;
    }

    private static _createItemHeaderHtml(item: ISPRequirement, consensusScr: number, weightedScore: number): string {
        let consensusScoreTxt = (consensusScr) ? `Consensus score: <b>${consensusScr}</b> (${weightedScore.toFixed(2)}%)` : `Pending`;
        let html = `
            <h3 class="${styles.categoryHeader}" reqNum="${item.RequirementNumber}" parent="${item.Parent}">
                <span reqNum="${item.RequirementNumber}">${item.RequirementNumber}</span>
                <span>${item.Title}</span>
                <span class="${styles.consensusScore}" name=${item.RequirementNumber}>${consensusScoreTxt}</span>
            </h3>`;

        return html;
    }

    private static _createScoreDetailsHtml(vendorId: number, reqNum: string, consensusScore: ISPScores, EPScores: ISPScores[], EPComments: ISPScores[]) { 

        let scoresHtml: string = '';
        let scoreSectionId = `${vendorId}-${reqNum}`;

        scoresHtml = `<div divName="consensusScoreContainer" class="${styles.scoreDetailsWithScorePanelContainer}"> `;
        if (EPScores) {
            scoresHtml += `<div name="scoreDetailsContainer" class="${styles.scoreDetailsPanelContainer}">
            <div class="${styles.scoreItem}">Name</div>
            <div class="${styles.scoreItem}">Score</div>
            <div class="${styles.scoreItem}">Comments</div>`;

            EPScores.forEach(s => {
                let filteredComments = EPComments.filter(c => c.EnteredBy["Title"] == s.EnteredBy["Title"]);                
                scoresHtml += `<div sid="${s.ID}" name="enteredBy" class="${styles.scoreItem}"> ${s.EnteredBy["Title"]} </div>
                <div sid="${s.ID}" name="score" class="${styles.scoreItem}"> ${s.Score} </div>
                <div sid="${s.ID}" name="comments" class="${styles.scoreItem}">`;
                filteredComments.forEach(c => {
                    if (!c.CommentText) c.CommentText = '';
                    scoresHtml += `<div>${c.RequirementNumber} (${c.Score}):  ${c.CommentText}</div>`;
                });
                scoresHtml += `</div>`;
            });

            scoresHtml += '</div>';

            scoresHtml += `<div id="consensusScores${scoreSectionId}" class="${styles.scorePanelContainer}">
                <div>Score :</div>
                <div>
                    <input value="${(consensusScore) ? consensusScore.Score : ''}"  name="score" type="text" required class="${styles.consensusScoreInput}" placeholder="0-9">
                    <input type="hidden" value="${reqNum}" name="reqNum">
                    <input type="hidden" value="${vendorId}" name="vendorId">
                </div>
                <div>Comments :</div>
                <div>
                    <textarea rows="4" class="${styles.textArea}" name="comment">${(consensusScore && consensusScore.CommentText) ? consensusScore.CommentText : ''}</textarea>
                </div>
                <div>
                <button id="${scoreSectionId}" name="btn_SaveConsensusScore">Save</button>
                <span class="${styles.scoreSavedMsg}">Saved</span>
                </div>
            </div>`;
        }

        scoresHtml += '</div>';
        return scoresHtml;
    }


    private static _createRequirementHtml(vendorId: number, items: ISPRequirement[], scores: ISPScores[], comments: ISPScores[]): string {

        let html: string = ``;

        //get top level qeustion that does not have parent question

        items.filter(r => r.Parent === null) 
            .forEach(e => {
            let consensusScore = scores.filter(s =>
                (s.RequirementNumber === e.RequirementNumber) &&
                (s.ScoreType === ScoreType.Consensus) &&
                (s.VendorID === vendorId));

            let consScore: ISPScores = (consensusScore && consensusScore.length > 0) ? consensusScore[0] : null;

            let scoresForReqNum = scores.filter(s =>
                (s.RequirementNumber === e.RequirementNumber) &&
                (s.ScoreType === ScoreType.EP) &&
                (s.VendorID === vendorId));

            //get all sub questions to get comments
            let subRequirementNumbers = items.filter(q => q.Parent == e.RequirementNumber).map(r => r.RequirementNumber);
            let filteredComments = comments.filter(c =>
                subRequirementNumbers.indexOf(c.RequirementNumber) >= 0 &&
                (c.ScoreType === ScoreType.EP) &&
                (c.VendorID === vendorId));
                    
            html += RequirementTemplate._createItemHeaderHtml(e, (consScore) ? consScore.Score : null,  (consScore) ? consScore.WeightedScore : null);
            html += RequirementTemplate._createScoreDetailsHtml(vendorId, e.RequirementNumber, consScore, scoresForReqNum, filteredComments);
        });



        return html;
    }

    public static getRequirementHtml(vendors: ISPVendor[], items: ISPRequirement[], scores: ISPScores[], comments: ISPScores[], webUrl: string): string {

        if (items === undefined || items.length === 0) return;

        let _innerHtml: string = '';

        vendors.forEach(v => {
            //calculate status: 
            //1. pending: no consensus score
            //2. in progress: # of consensus score < total # of requirement question
            //3. complete: # of consensus score == total # of requirement question
            //if complated set consensus score otherwise NULL
            let consensusScore = scores.filter(s =>                
                (s.ScoreType === ScoreType.Consensus) &&
                (s.VendorID === v.ID));

            let _topRequirements = items.filter(r => r.Parent === null);    
            let _status: string = "Pending";
            let _totalScore: number = null;
            let _totalWeightedScore: number = null;
            if(consensusScore.length > 0 && consensusScore.length < _topRequirements.length) {
                _status = "In Progess";
            }
            else if(consensusScore.length === _topRequirements.length){
                _status = "Completed";
                _totalScore = consensusScore.reduce((sum, current) => sum + current.Score, 0);    
                _totalWeightedScore = consensusScore.reduce((sum, current) => sum + current.WeightedScore, 0);    
            }

            _innerHtml += RequirementTemplate._createVendorHeaderHtml(v, _totalScore, _totalWeightedScore, _status);
            _innerHtml += `<div divName="consensusAccordion">`;
            _innerHtml += RequirementTemplate._createRequirementHtml(v.ID, items, scores, comments);
            _innerHtml += `</div>`;
        });
        let html: string = `
        <body>
            <div class="${styles.breadcrumb}">
                <span class="${styles.goBackLinkStyle}">
                    <a href="${webUrl}">Home</a>
                    <span> | </span>
                    <span>Consensus Evaluation</span>
                </span>
                <span class="${styles.goBackLinkStyleRight}">
                    <button class="${styles.buttonLinkStyle}">Print View</button>
                </span>
            </div>
            <div id="requirementDetailsDiv" divName="consensusAccordion"  class="${ styles.detail}">
                ${_innerHtml}
            </div>
        </body>`;

        return html;
    }
}