import { Injectable } from '@angular/core';
import { AngularFire, FirebaseAuthState } from 'angularfire2';
import { Observable, Subject } from 'rxjs/Rx';

import { AuthService } from '../security/auth.service';
import { UserService } from '../model/user.service';

@Injectable()
export class ChatService {

	authInfo: FirebaseAuthState;

	constructor(private af: AngularFire, private authService: AuthService, private userService: UserService) {
		this.authService.auth$.subscribe(
			data => {
				this.authInfo = data;
			},
			err => {
				console.log('auth error chat service', err);
			}
		);
	}

	getAllMessages(chatKey: string): Observable<Message[]> {
		let msgArrTemp: Message[];
		return this.af.database.list(`chatMessages/${chatKey}`).flatMap(msgArr => {
			msgArrTemp = msgArr;
			return Observable.combineLatest(msgArr.map(msg => (this.userService.findUser(msg.from))));
		}).map(userArr => {
			return msgArrTemp.map((msg, msgIndex) => {
				msg.from = userArr[msgIndex];
				return msg;
			});
		});
	}

	getAllStatuses(chatKey: string): Observable<Status[]> {
		let statusArrTemp: Status[];
		return this.af.database.list(`statusMessages/${chatKey}`).flatMap(statusArr => {
			statusArrTemp = statusArr;
			return Observable.combineLatest(statusArr.map(status => (this.userService.findUser(status.user))));
		}).map(userArr => {
			return statusArrTemp.map((status, statusIndex) => {
				status.user = userArr[statusIndex];
				return status;
			});
		});
	}

	createChat(): Observable<any> {
		const chats = this.af.database.list('chats');
		const chatObj: Chat = {
			created: Date.now(),
			createdBy: this.authInfo ? this.authInfo.uid : null
		};

		return this.observableToPromise(chats.push(chatObj));
	}

	sendMessage(msgText: string, chatKey: string): Observable<any> {
		const chatMessages = this.af.database.list(`chatMessages/${chatKey}`);
		const message: Message = {
			text: msgText,
			from: this.authInfo ? this.authInfo.uid : null,
			time: Date.now(),
		};
		return this.observableToPromise(chatMessages.push(message));
	}

	sendStatus(statusType: StatusOptions, chatKey: string): Observable<any> {
		const statusMessages = this.af.database.list(`statusMessages/${chatKey}`);
		const status: Status = {
			type: statusType,
			time: Date.now(),
			user: this.authInfo ? this.authInfo.uid : null,
		};
		return this.observableToPromise(statusMessages.push(status));
	}

	private observableToPromise(promise): Observable<any> {

		const subject = new Subject<any>();

		promise
			.then(res => {
					subject.next(res);
					subject.complete();
				},
				err => {
					subject.error(err);
					subject.complete();
				});

		return subject.asObservable();
	}

}

export interface Chat {
	created: number;
	createdBy: string;
}

export interface Message {
	text: string;
	from: string | any;
	time: number;
}

export interface Status {
	type: StatusOptions;
	time: number;
	user: string | any;
}

export type StatusOptions = 'join' | 'leave';