import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupProfileComponent } from './setup-profile.component';

describe('SetupProfileComponent', () => {
  let component: SetupProfileComponent;
  let fixture: ComponentFixture<SetupProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupProfileComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
