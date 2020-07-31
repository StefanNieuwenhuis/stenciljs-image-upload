import { Component, Element, Event, EventEmitter, Prop, State } from '@stencil/core';

// const maxUploadSize = 1024; // bytes
const ALLOWED_FILE_TYPES = 'image.*';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @Prop() public label: string;
  @Prop() public maxUploadSize: number; // in bytes
  @State() imgUploaded: boolean = false;
  @Event() onUploadCompleted: EventEmitter<Blob>;
  @Element() private elementHost: HTMLElement;
  private fileInputRef: HTMLElement;


  public onRemoveImage(event: any): void {
    let imagePreviewContainer: HTMLElement = this.elementHost.shadowRoot.querySelector('#image-preview');
    imagePreviewContainer.style.backgroundImage = null;
    this.imgUploaded = false;
    // console.log(this.fileInputRef.attributes[1].nodeValue)
    this.fileInputRef.attributes[1].nodeValue = ""
    this.fileInputRef.attributes[1].nodeValue = "file"
    event.preventDefault()
  }

  public onInputChange(files: FileList) {
    // check if 1 image is uploaded
    if (files.length === 1) {
      const imageFile = files[0];
      // check if the user isn't trying to upload a file larger then the maxUploadSize
      if (!this.checkFileSize(imageFile.size)) {
        console.error('Maximum file size exceeded. Max file size is: ' + this.maxUploadSize);
        return false;
      }
      // check if the user isn't trying to upload anything else then an image
      else if (!this.checkFileType(imageFile.type)) {
        console.error('File type is not allowed');
        return false;
      }

      // upload image
      this.uploadImage(imageFile);
    } else {
      console.error(files.length === 0 ? 'NO IMAGE UPLOADED' : 'YOU CAN ONLY UPLOAD ONE IMAGE AT THE TIME');
      return false;
    }
  }

  private uploadImage(file) {
    console.log(typeof file);
    // create a new instance of HTML5 FileReader api to handle uploading
    const reader = new FileReader();

    reader.onloadstart = () => {
      console.log('started uploading');
    }

    reader.onload = () => {
      const imagePreviewContainer: HTMLElement = this.elementHost.shadowRoot.querySelector('#image-preview');
      imagePreviewContainer.style.backgroundImage = `url(${reader.result})`;
      
      console.log('uploading finished, emitting an image blob to the outside world');
      this.onUploadCompleted.emit(file);
    };

    reader.onloadend = () => {
      console.log('upload finished');
    };

    reader.onerror = (err) => {
      console.error('something went wrong...', err);
    };
    reader.readAsDataURL(file);
  }

  private checkFileSize(size: number): boolean {
    // check if size is greater than maxUploadSize
    if (size > this.maxUploadSize) {
      return false;
    } else {
      return true;
    }
  }

  private checkFileType(type: string): boolean {
    return type.match(ALLOWED_FILE_TYPES).length > 0;
  }

  render() {
    return (
    <div class="image-upload">
      <div class='custom-label'>
        <label class="label">
          {this.label}
        </label>
      </div>
      <div class="image-upload__wrapper">
        <div class="image-upload__edit">
          <label htmlFor="file" class="editButton"></label>
          <label htmlFor="file" class="closeButton" onClick={(event: any) => this.onRemoveImage(event)}></label>
          <input 
            type="file" 
            name="files[]" 
            id="file" 
            accept="image/*" 
            class="image-upload__input"
            ref={(el: HTMLElement) => (this.fileInputRef = el)}
            onChange={($event: any) => this.onInputChange($event.target.files)} 
            />
        </div>

        <div class="image-upload__preview">
          <div id="image-preview"></div>
        </div>
      </div>
    </div>);
  }
}

