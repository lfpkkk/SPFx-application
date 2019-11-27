import { Version, Environment, EnvironmentType, UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import styles from './ConsensusWebPart.module.scss';
import * as strings from 'ConsensusWebPartStrings';
import MockConsensusHttpClient from './MockConsensusHttpClient';
import { ISPRequirement, ISPScores, ISPRequirementList, ISPScoresList, ScoreType, ISPVendor, ISPVendorsList, ISPScoreWeightings, ISPScoreWeightingsList } from './consensus-entities';
import RequirementTemplate from './RequirementTemplate';

import * as jQuery from 'jquery';
import 'jqueryui';
import { SPComponentLoader } from '@microsoft/sp-loader';
import ConsensusService from './consensus-service';


export interface IConsensusWebPartProps {
  description: string;
}

export default class ConsensusWebPart extends BaseClientSideWebPart<IConsensusWebPartProps> {

  public constructor() {
    super();

    SPComponentLoader.loadCss('//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css');

  }
  private _vendorId: string = '';

  private _getQryStringValues(): void {

    var queryParms = new UrlQueryParameterCollection(window.location.href);

    if (queryParms.getValue('vId')) {
      this._vendorId = queryParms.getValue('vId');
    }

  }

  public render(): void {

    this._getQryStringValues();

    this.domElement.innerHTML = `
    <div class="${ styles.consensus}">
      <div class="${ styles.container}">
        <div id="consensusDiv">
        </div>
      </div>
    </div>`;
    this._checkPermissions();
    ConsensusService._hideOnStartUp();
  }

  private _isFullAccess: boolean;
  private _isReadOnly: boolean;

  private _checkPermissions() {
    this.consensusService = (Environment.type === EnvironmentType.Local) ?
      new MockConsensusHttpClient() :
      new ConsensusService(this.context);

    this.consensusService.getUserGroups().then(groups => {
      this._isFullAccess = (groups.indexOf("DOE Consensus Full") !== -1) ? true : false;
      this._isReadOnly = (groups.indexOf("DOE Consensus ReadOnly") !== -1) ? true : false;

      if (this._isFullAccess || this._isReadOnly) {
        this._renderListAsync();
      } else {
        jQuery('div[id="consensusDiv"').text("Sorry, You does not have right privilege access this page.");
      }
    });
  }

  private _LoggedInUserId: number;
  private consensusService;

  private _renderListAsync(): void {

    this.consensusService.getLoggedInUserId()
      .then(user => {
        this._LoggedInUserId = user;
      });

    this.consensusService.getVendors()
      .then((vendors: ISPVendorsList) => this._onVendorsFetched(vendors.value))
      .then(() => {
        this.consensusService.getRequirements()
          .then((requirements: ISPRequirementList) => this._onRequirementsFetched(requirements.value))
          .then(() => {
            this.consensusService.getScoreWeightings()
              .then((weight: ISPScoreWeightingsList) => this.onWeightsFetched(weight.value))
              .then(() => {
                this.consensusService.getComments()
                  .then((comments: ISPScoresList) => this._onCommentsFetched(comments.value))
                  .then(() => {
                    this.consensusService.getScores()
                      .then((response: ISPScoresList) => {
                        this._afterScoresFetched(response.value);
                        this._renderRequirementList();
                      });
                  });
              });
          });
      });

  }

  private _vendors: ISPVendor[] = [];
  private _onVendorsFetched(vendors: ISPVendor[]) {
    this._vendors = vendors.map(v => v);
  }

  private _scores: ISPScores[] = [];
  private _afterScoresFetched(scores: ISPScores[]) {
    scores.forEach(s => {
      let score = s;
      if (score.ScoreType == ScoreType.Consensus) {
        score.WeightedScore = s.Score / 9 * this._scoreWeightings[s.RequirementNumber];        
      }
      this._scores.push(score);
    });
  }

  //make key : value array
  private _scoreWeightings: { [id: string]: number; } = {};
  private onWeightsFetched(weights: ISPScoreWeightings[]) {
    //go through requirement and add weight if exists otherwise 1
    this._requirements.forEach(r => {
      let filtereedWeight = weights.filter(w => w.RequirementNumber === r.RequirementNumber);
      let weight = (filtereedWeight.length > 0) ? filtereedWeight[0].ScoreWeight : 1;
      this._scoreWeightings[r.RequirementNumber] = weight;
    });
  }

  private _requirements: ISPRequirement[] = [];
  private _onRequirementsFetched(requirements: ISPRequirement[]) {
    this._requirements = requirements.map(r => r);
  }

  private _comments: ISPScores[] = [];
  private _onCommentsFetched(comments: ISPScores[]) {
    this._comments = comments.map(r => r);
  }

  private _renderRequirementList() {

    let html: string = RequirementTemplate.getRequirementHtml(this._vendors, this._requirements, this._scores, this._comments, this.context.pageContext.web.absoluteUrl);

    const consensusDivElement: Element = this.domElement.querySelector('#consensusDiv');
    consensusDivElement.innerHTML = html;

    const accordionOptions: JQueryUI.AccordionOptions = {
      animate: true,
      collapsible: true,
      active: false,
      heightStyle: "content"
    };

    jQuery('[divName="consensusAccordion"]').accordion(accordionOptions);

    this._onReadOnly();
    this._addEventHandler();
  }

  private _onReadOnly() {
    if (this._isReadOnly && !this._isFullAccess) { //user who has both full access and readonly can still edit
      jQuery('input').prop("readOnly", true);
      jQuery('textarea').prop("readOnly", true);
      jQuery('button[name="btn_SaveConsensusScore"]').prop("disabled", true); // use jQuery().button("disabled") incurs err msg
    }
  }

  private _addEventHandler() {

    jQuery('div[divName="consensusScoreContainer"]')
      .on('click', 'button[name="btn_SaveConsensusScore"]', (event, ui) => {

        let ConsensusScoreSectionId = event.target.getAttribute('id');
        let ConsensusScoreContainer = jQuery('div[id="consensusScores' + ConsensusScoreSectionId + '"]');
        let vendorId = ConsensusScoreContainer.find('input[name="vendorId"][type="hidden"]').val();
        let reqNumber = ConsensusScoreContainer.find('input[name="reqNum"][type="hidden"]').val();
        let consensusScore = ConsensusScoreContainer.find('input[name="score"][type="text"]').val();
        let consensusComments = ConsensusScoreContainer.find('textarea[name="comment"]').val();

        if (!consensusScore) {
          alert('Please enter a valid Consensus score.');
          return;
        }

        let scoreNumber = Number(consensusScore);
        if (isNaN(scoreNumber)) {
          alert('Please enter score between 0-9, number only');
          return;
        }

        if (!(scoreNumber >= 0 && scoreNumber <= 9)) {
          alert('Please enter score between 0-9');
          return;
        }

        if ((consensusComments as string).trim().length === 0) {
          alert('Please enter comment');
          return;
        }

        this.consensusService.saveConsensusScoreDetails(reqNumber, vendorId, consensusScore, consensusComments, this._LoggedInUserId);

        //update question consensue score on screen
        let weightedScore = scoreNumber / 9 * this._scoreWeightings[reqNumber as string];
        jQuery(`h2[vendorid="${vendorId}"]`)
          .next()
          .find(`span[name="${reqNumber}"]`)
          .html(`Consensus score: <b>${scoreNumber}</b> (${weightedScore.toFixed(2)}%)`); // only match span for current vendor

        //update vendor consensus score on screen
        let scoreBox = jQuery(`h2[vendorid="${vendorId}"]`).next().find(`div[id^="consensusScores"]`);
        let scoreCount = 0;
        let totalScore = 0;
        let totalWeightScore = 0;
        scoreBox.each((i, ele)=> {
            reqNumber = jQuery(ele).find('input[name="reqNum"][type="hidden"]').val();
            consensusScore = jQuery(ele).find('input[name="score"][type="text"]').val();
            if(consensusScore != "" && !isNaN(Number(consensusScore))){              
              totalScore += Number(consensusScore);
              totalWeightScore += (Number(consensusScore) / 9 * this._scoreWeightings[reqNumber as string]);
              scoreCount ++;
            }
        });
        
        let vendorScorehtml = "In Progress";
        if(scoreBox.length == scoreCount && scoreCount > 0){
          vendorScorehtml = `Consensus score: <b>${totalScore}</b> (${totalWeightScore.toFixed(2)}%)`;
        }
        jQuery(`h2[vendorid="${vendorId}"]`)
        .find(`span[name="vendorConsensusScore"]`)
        .html(vendorScorehtml);
      });
    this._showConsensusEventHandler();   

  }

  private _showConsensusEventHandler(): void {

    this.domElement.querySelector('#consensusDiv').addEventListener('click', (event) => {

      if ((event.srcElement as HTMLElement).id !== 'evalDiv') {

        const _srcElement: HTMLAnchorElement = (event.srcElement as HTMLAnchorElement);

        if (_srcElement.innerHTML === 'Print View') {
          this._assignPrintView();
        }
      }
    });
  }

  private _assignPrintView() : void {
    let element = jQuery(`div[id="requirementDetailsDiv"]`);

    // copy html
    let printHTML = `<div style="float:right;"><button id="printPageBtn" onClick="window.print();">Print</button></div>`; // print button
    printHTML += `
    <div style="clear:both">
      <h1>Consensus Report as at ${this._date}</h1>
      ${element.html()}
    </div>`;

    // after copy html
    // element.find(`div[divName=consensusAccordion]`).hide();
    // element.find(`div[divname="consensusScoreContainer"]`).hide();
    if(this._isFullAccess) {
      element.find('input').prop("readOnly",false);
      element.find('textarea').prop("readOnly",false);
      element.find(`button[name="btn_SaveConsensusScore"]`).prop("disabled",false);
    }

    // popup window
    let windowName: string = 'ConsensusWebPartPrintViewWindow'; // assign window a unique name
    // popup in centre of screen, not work for dualscreen
    let height = 670, width = element.width();
    let left = (screen.width - width) / 2;
    let top = (screen.height - height) / 4;
    let win = window.open('', windowName, `location=no,height='${height}',width='${width}',left='${left}',top='${top}',scrollbars=yes,status=yes`); //set a unique window name
    
    // get css stylings
    let cssText: string = "";
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        let css = (<CSSStyleSheet>document.styleSheets[i]).cssRules;
        if (css[0].cssText.indexOf("consensus") > 0) {
          for (let j = 0; j < document.styleSheets.length; j++) {
              cssText += css[j].cssText.replace(`.${styles.consensus} `, "");  
          }
          break;          
        }
      }
      catch{ }
    }
    
    // hide print button when print
    win.document.head.innerHTML = `<style> 
      @media print {
        body {
          -webkit-print-color-adjust: exact; // Chrome
          color-adjust: exact; // Firefox
        }
        #printPageBtn {
          display: none;
          width: 80px;
        }
      }
      ${cssText}
    </style>`;
    win.document.body.innerHTML = printHTML;

    this._getPrintViewFormatted($(win.document.body));
  }

  get _date() : string {
    let today = new Date();
    return today.toLocaleDateString('en-GB');
  }

  private _getPrintViewFormatted(body: JQuery<HTMLElement>) {
    let style = {
      backgroundColor: '#eaeded !important',
      padding: '10px'
    };
    body.find(`h2`).css(style);
    body.find(`div[divName=consensusAccordion]`).show();
    body.find(`div[divname="consensusScoreContainer"]`).show();
    body.find('input').prop('readOnly',true);
    body.find(`button[name="btn_SaveConsensusScore"]`).hide();    
    body.find('textarea').each(function(index,element) {
      let html = `<div style="word-wrap: break-word; white-space:pre-wrap;">${element.innerHTML}</div>`;
      jQuery(this).after(html);
      jQuery(this).remove();
    });
    body.find(`div[id^="consensusScores"]`).each(function() {
      let score = jQuery(this).find(`div:contains("Score :")`);
      score.css('font-weight','bold');
      score.append(` ${score.next().find(`input[name="score"]`).val()}`);
      score.next().remove();

      let comment = jQuery(this).find(`div:contains("Comments :")`);
      comment.css('font-weight','bold');
    });

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
