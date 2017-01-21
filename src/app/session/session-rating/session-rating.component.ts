import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../shared/model/session.service';
import { Session, SessionRating } from '../../shared/model/session';
import { SessionPopup } from '../session-popup';

@Component({
	selector: 'app-session-rating',
	templateUrl: './session-rating.component.html',
	styleUrls: ['./session-rating.component.scss']
})
export class SessionRatingComponent extends SessionPopup implements OnInit {

	sessionId: string;
	sessionInfo: Session;
	ratingModel: SessionRating = {
		rating: undefined,
		comment: ''
	};

	constructor(protected sessionService: SessionService) {
		super();
	}

	ngOnInit() {
	}

	submitRating() {
		this.sessionService.changeRating(this.sessionId, this.sessionService.uid, this.ratingModel).subscribe(
			val => {
				this.closeModal(true);
			},
			err => {console.log(err); }
		);
	}

}
