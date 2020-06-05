import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDetailsModalComponent } from './post-details-modal.component';

describe('PostDetailsModalComponent', () => {
  let component: PostDetailsModalComponent;
  let fixture: ComponentFixture<PostDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostDetailsModalComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
