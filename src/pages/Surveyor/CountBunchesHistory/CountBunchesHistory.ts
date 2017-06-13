﻿import { Component } from '@angular/core';
import { NavController, NavParams,  ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {SharedFunctions} from '../../../providers/Shared/Functions';
import * as constants from '../../../config/constants';

@Component({
    selector: 'page-history',
    templateUrl: 'CountBunchesHistory.html'
})
export class CountBunchesHistoryPage {
    labelsFromStorage: any;
    countHistoryData: any;
    constructor(private mainMenu: SharedFunctions, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
        // this.getLanguage();
        var url = constants.DREAMFACTORY_TABLE_URL+ "/transact_survey_view?api_key="+constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.countHistoryData = data["resource"];

        });
    }

    // openGlobalMenu() {
    //     this.mainMenu.openMenu();
    // }
    itemSelected(item: string) {
        console.log("Selected Item", item);
    }
}


