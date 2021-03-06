import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/model/user';
import { UserStatus } from '../../shared/model/user.service';

@Component({
	selector: 'app-user-chip',
	templateUrl: './user-chip.component.html',
	styleUrls: ['./user-chip.component.scss']
})
export class UserChipComponent implements OnInit, OnChanges {

	@Input()
	user: User;

	@Input()
	removable: boolean;

	@Output()
	onRemove = new EventEmitter<void>();

	@Input()
	clickable = true;

	get statusColor(): string {
		switch (this.user.status) {
			case UserStatus.ONLINE: return '#00C851';
			case UserStatus.OFFLINE: return '#4B515D';
			case UserStatus.IN_SESSION: return '#FFBB33';
		}
		return '#4B515D';
	};

	constructor(private router: Router) { }

	ngOnInit() {
	}

	ngOnChanges(changes: {[key: string]: SimpleChange}) {
		this.user = changes['user'].currentValue;
	}

	emitRemove(e: MouseEvent) {
		e.stopPropagation();
		this.onRemove.emit();
	}

	viewUser(e: Event) {
		if (this.clickable) {
			e.stopPropagation();
			this.router.navigate(['user', this.user.$key]);
		}
	}
}
