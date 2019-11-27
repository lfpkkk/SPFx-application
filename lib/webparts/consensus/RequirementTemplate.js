import { ScoreType } from "./consensus-entities";
import styles from './ConsensusWebPart.module.scss';
var RequirementTemplate = /** @class */ (function () {
    function RequirementTemplate() {
    }
    RequirementTemplate._createVendorHeaderHtml = function (item, consensusScr, weightedScore, status) {
        //if not completed then pass null in score
        var consensusScoreTxt = (consensusScr) ? "Consensus score: <b>" + consensusScr + "</b> (" + weightedScore.toFixed(2) + "%)" : status;
        var html = "<h2 class=\"" + styles.categoryHeader + "\" vendorId=\"" + item.ID + "\">\n                <span>" + item.Alias + "</span>\n                <span name=\"vendorConsensusScore\" class=\"" + styles.consensusScore + "\">" + consensusScoreTxt + "</span>\n            </h2>";
        return html;
    };
    RequirementTemplate._createItemHeaderHtml = function (item, consensusScr, weightedScore) {
        var consensusScoreTxt = (consensusScr) ? "Consensus score: <b>" + consensusScr + "</b> (" + weightedScore.toFixed(2) + "%)" : "Pending";
        var html = "\n            <h3 class=\"" + styles.categoryHeader + "\" reqNum=\"" + item.RequirementNumber + "\" parent=\"" + item.Parent + "\">\n                <span reqNum=\"" + item.RequirementNumber + "\">" + item.RequirementNumber + "</span>\n                <span>" + item.Title + "</span>\n                <span class=\"" + styles.consensusScore + "\" name=" + item.RequirementNumber + ">" + consensusScoreTxt + "</span>\n            </h3>";
        return html;
    };
    RequirementTemplate._createScoreDetailsHtml = function (vendorId, reqNum, consensusScore, EPScores, EPComments) {
        var scoresHtml = '';
        var scoreSectionId = vendorId + "-" + reqNum;
        scoresHtml = "<div divName=\"consensusScoreContainer\" class=\"" + styles.scoreDetailsWithScorePanelContainer + "\"> ";
        if (EPScores) {
            scoresHtml += "<div name=\"scoreDetailsContainer\" class=\"" + styles.scoreDetailsPanelContainer + "\">\n            <div class=\"" + styles.scoreItem + "\">Name</div>\n            <div class=\"" + styles.scoreItem + "\">Score</div>\n            <div class=\"" + styles.scoreItem + "\">Comments</div>";
            EPScores.forEach(function (s) {
                var filteredComments = EPComments.filter(function (c) { return c.EnteredBy["Title"] == s.EnteredBy["Title"]; });
                scoresHtml += "<div sid=\"" + s.ID + "\" name=\"enteredBy\" class=\"" + styles.scoreItem + "\"> " + s.EnteredBy["Title"] + " </div>\n                <div sid=\"" + s.ID + "\" name=\"score\" class=\"" + styles.scoreItem + "\"> " + s.Score + " </div>\n                <div sid=\"" + s.ID + "\" name=\"comments\" class=\"" + styles.scoreItem + "\">";
                filteredComments.forEach(function (c) {
                    if (!c.CommentText)
                        c.CommentText = '';
                    scoresHtml += "<div>" + c.RequirementNumber + " (" + c.Score + "):  " + c.CommentText + "</div>";
                });
                scoresHtml += "</div>";
            });
            scoresHtml += '</div>';
            scoresHtml += "<div id=\"consensusScores" + scoreSectionId + "\" class=\"" + styles.scorePanelContainer + "\">\n                <div>Score :</div>\n                <div>\n                    <input value=\"" + ((consensusScore) ? consensusScore.Score : '') + "\"  name=\"score\" type=\"text\" required class=\"" + styles.consensusScoreInput + "\" placeholder=\"0-9\">\n                    <input type=\"hidden\" value=\"" + reqNum + "\" name=\"reqNum\">\n                    <input type=\"hidden\" value=\"" + vendorId + "\" name=\"vendorId\">\n                </div>\n                <div>Comments :</div>\n                <div>\n                    <textarea rows=\"4\" class=\"" + styles.textArea + "\" name=\"comment\">" + ((consensusScore && consensusScore.CommentText) ? consensusScore.CommentText : '') + "</textarea>\n                </div>\n                <div>\n                <button id=\"" + scoreSectionId + "\" name=\"btn_SaveConsensusScore\">Save</button>\n                <span class=\"" + styles.scoreSavedMsg + "\">Saved</span>\n                </div>\n            </div>";
        }
        scoresHtml += '</div>';
        return scoresHtml;
    };
    RequirementTemplate._createRequirementHtml = function (vendorId, items, scores, comments) {
        var html = "";
        //get top level qeustion that does not have parent question
        items.filter(function (r) { return r.Parent === null; })
            .forEach(function (e) {
            var consensusScore = scores.filter(function (s) {
                return (s.RequirementNumber === e.RequirementNumber) &&
                    (s.ScoreType === ScoreType.Consensus) &&
                    (s.VendorID === vendorId);
            });
            var consScore = (consensusScore && consensusScore.length > 0) ? consensusScore[0] : null;
            var scoresForReqNum = scores.filter(function (s) {
                return (s.RequirementNumber === e.RequirementNumber) &&
                    (s.ScoreType === ScoreType.EP) &&
                    (s.VendorID === vendorId);
            });
            //get all sub questions to get comments
            var subRequirementNumbers = items.filter(function (q) { return q.Parent == e.RequirementNumber; }).map(function (r) { return r.RequirementNumber; });
            var filteredComments = comments.filter(function (c) {
                return subRequirementNumbers.indexOf(c.RequirementNumber) >= 0 &&
                    (c.ScoreType === ScoreType.EP) &&
                    (c.VendorID === vendorId);
            });
            html += RequirementTemplate._createItemHeaderHtml(e, (consScore) ? consScore.Score : null, (consScore) ? consScore.WeightedScore : null);
            html += RequirementTemplate._createScoreDetailsHtml(vendorId, e.RequirementNumber, consScore, scoresForReqNum, filteredComments);
        });
        return html;
    };
    RequirementTemplate.getRequirementHtml = function (vendors, items, scores, comments, webUrl) {
        if (items === undefined || items.length === 0)
            return;
        var _innerHtml = '';
        vendors.forEach(function (v) {
            //calculate status: 
            //1. pending: no consensus score
            //2. in progress: # of consensus score < total # of requirement question
            //3. complete: # of consensus score == total # of requirement question
            //if complated set consensus score otherwise NULL
            var consensusScore = scores.filter(function (s) {
                return (s.ScoreType === ScoreType.Consensus) &&
                    (s.VendorID === v.ID);
            });
            var _topRequirements = items.filter(function (r) { return r.Parent === null; });
            var _status = "Pending";
            var _totalScore = null;
            var _totalWeightedScore = null;
            if (consensusScore.length > 0 && consensusScore.length < _topRequirements.length) {
                _status = "In Progess";
            }
            else if (consensusScore.length === _topRequirements.length) {
                _status = "Completed";
                _totalScore = consensusScore.reduce(function (sum, current) { return sum + current.Score; }, 0);
                _totalWeightedScore = consensusScore.reduce(function (sum, current) { return sum + current.WeightedScore; }, 0);
            }
            _innerHtml += RequirementTemplate._createVendorHeaderHtml(v, _totalScore, _totalWeightedScore, _status);
            _innerHtml += "<div divName=\"consensusAccordion\">";
            _innerHtml += RequirementTemplate._createRequirementHtml(v.ID, items, scores, comments);
            _innerHtml += "</div>";
        });
        var html = "\n        <body>\n            <div class=\"" + styles.breadcrumb + "\">\n                <span class=\"" + styles.goBackLinkStyle + "\">\n                    <a href=\"" + webUrl + "\">Home</a>\n                    <span> | </span>\n                    <span>Consensus Evaluation</span>\n                </span>\n                <span class=\"" + styles.goBackLinkStyleRight + "\">\n                    <button class=\"" + styles.buttonLinkStyle + "\">Print View</button>\n                </span>\n            </div>\n            <div id=\"requirementDetailsDiv\" divName=\"consensusAccordion\"  class=\"" + styles.detail + "\">\n                " + _innerHtml + "\n            </div>\n        </body>";
        return html;
    };
    return RequirementTemplate;
}());
export default RequirementTemplate;
//# sourceMappingURL=RequirementTemplate.js.map