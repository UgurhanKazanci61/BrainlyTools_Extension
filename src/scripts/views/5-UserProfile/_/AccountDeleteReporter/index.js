import Build from "@/scripts/helpers/Build";
import InsertAfter from "@/scripts/helpers/InsertAfter";
import ServerReq from "@ServerReq";
import { Button, Flex, Input, Text, Textarea } from "@style-guide";
import JSZip from "jszip";
import notification from "../../../../components/notification2";
import Progress from "../../../../components/Progress";
import Evidence from "./Evidence";

let PREVENT_FN = event => {
  event.preventDefault();
  event.stopPropagation();
};

export default class AccountDeleteReporter {
  constructor() {
    /**
     * @type {Evidence[]}
     */
    this.evidences = [];
    /**
     * @type {HTMLFormElement}
     */
    this.deleteForm = (document.querySelector("#DelUserAddForm"));

    if (!this.deleteForm)
      return this;

    /**
     * @type {HTMLElement}
     */
    this.deleteLink = (this.deleteForm.previousElementSibling);

    this.Render();
    this.RenderAddFileInput();
    this.RenderAttachmentGrabber();
    this.RenderProgress();
    this.BindHandlers();
  }
  Render() {
    this.container = Build(Flex({
      direction: "column",
      marginTop: "xs",
      marginRight: "xs",
      marginBottom: "s",
      marginLeft: "xs",
    }), [
      [
        Flex({ justifyContent: "center" }),
        this.reasonMessage = Textarea({
          tag: "textarea",
          fullWidth: true,
          placeholder: `${System.data.locale.userProfile.accountDelete
            .reasonForDeletion}..`,
        })
      ],
      [
        Flex({ direction: "column", marginTop: "m", }),
        [
          this.fileContainer = Flex({ direction: "column" }),
          [
            Flex(),
            this.addFileButton = Button({
              type: "outline",
              size: "small",
              fullWidth: true,
              html: System.data.locale.userProfile.accountDelete
                .addFiles,
              icon: {
                color: "dark",
                type: "attachment",
              },
            })
          ]
        ]
      ],
      [
        Flex({ marginTop: "m", justifyContent: "center", }),
        this.deleteButton = Button({
          size: "small",
          type: "solid-peach",
          html: `${System.data.locale.common.delete}!`,
        })
      ],
    ]);

    let deleteButtonContainer = this.deleteForm.querySelector("div.submit");

    InsertAfter(this.container, this.deleteForm);
    deleteButtonContainer.remove();
  }
  RenderAddFileInput() {
    this.fileInput = Input({
      type: "file",
      multiple: true,
    });
  }
  RenderAttachmentGrabber() {
    this.attachmentGrabberContainer = Build(Flex({
      alignItems: "center",
      justifyContent: "center",
      className: "attachmentGrabberContainer",

    }), [
      [
        this.attachmentGrabberTextContainer = Flex(),
        this.attachmentGrabberText = Text({
          weight: "bold",
          size: "large",
          html: "Drop files here",
        })
      ]
    ]);
  }
  RenderProgress() {
    this.progressContainer = Flex({
      marginTop: "s",
      direction: "column",
    });
    this.progress = new Progress({
      type: "loading",
      label: "",
      max: 100
    });
  }
  BindHandlers() {
    if (System.checkUserP(0)) {
      this.deleteLink
        .addEventListener("click", this.DeleteLinkClicked.bind(this));
      this.deleteLink
        .addEventListener("dblclick", this.DeleteLinkDoubleClicked.bind(
          this));
    }

    this.addFileButton
      .addEventListener("click", this.fileInput.click.bind(this.fileInput));
    /* this.deleteForm
      .addEventListener("submit", this.DeleteFormSubmitted.bind(this)); */
    this.deleteButton
      .addEventListener("click", () => this.SubmitDeleteForm());

    this.fileInput.addEventListener("change", this.ProcessFiles.bind(this));

    let container = document.getElementById("container");
    ['dragenter', 'dragover', 'dragleave', "dragend", 'drop']
    .forEach(eventName => {
      container.addEventListener(eventName, PREVENT_FN);
      document.body.addEventListener(eventName, PREVENT_FN);
      this.attachmentGrabberContainer
        .addEventListener(eventName, PREVENT_FN);
    });

    container
      .addEventListener("dragenter", this.ShowAttachmentGrabber.bind(this));
    container
      .addEventListener("dragover", this.ShowAttachmentGrabber.bind(this));
    this.attachmentGrabberContainer
      .addEventListener("drop", this.ProcessFiles.bind(this));
    document.body
      .addEventListener("dragleave", this.HideAttachmentGrabber.bind(this));
  }
  ShowAttachmentGrabber() {
    if (this.container.classList.contains("file-dragging"))
      return;

    this.attachmentGrabberContainer.style.height =
      (this.container.offsetHeight + 10) + "px";

    this.container.classList.add("file-dragging");
    this.deleteLink.parentElement.prepend(this.attachmentGrabberContainer);
  }
  HideAttachmentGrabber() {
    this.container.classList.remove("file-dragging");
    this.HideElement(this.attachmentGrabberContainer);
  }

  /**
   * @param {HTMLElement} element
   */
  HideElement(element) {
    if (!element || !element.parentNode)
      return;

    element.parentNode.removeChild(element);
  }
  /**
   * @param {JQuery.ClickEvent} event
   */
  DeleteLinkClicked(event) {
    if (!event.shiftKey)
      return;

    this.DeleteAccount(true);
  }
  /**
   * @param {JQuery.DoubleClickEvent} event
   */
  DeleteLinkDoubleClicked(event) {
    if (
      event.shiftKey ||
      !confirm(System.data.locale.userProfile.notificationMessages
        .confirmAccountDeletion)
    )
      return;

    this.DeleteAccount(true);
  }
  /**
   * @param {boolean} [fastDelete]
   */
  async DeleteAccount(fastDelete) {
    notification({
      type: "info",
      permanent: true,
      html: `${System.data.locale.core.reportedCommentsDeleter.deleting}..`,
    });
    await System.Delay(500);
    this.deleteForm.classList.add("always-hidden");
    this.SubmitDeleteForm(fastDelete);
  }
  /**
   * @param {boolean} [fastDelete]
   */
  async SubmitDeleteForm(fastDelete) {
    this.progressContainer.innerHTML = "";

    if (
      !fastDelete &&
      !this.IsFormFilled() &&
      !confirm(System.data.locale.userProfile.notificationMessages
        .confirmNoEvidenceOrComment)
    )
      return;

    try {
      this.ShowProgress();
      await this.PrepareForm();

      let resAccountDeleteReport = await this
        .SendFormDataToExtensionServer();

      if (!resAccountDeleteReport || !resAccountDeleteReport.success) {
        return notification({
          html: System.data.locale.userProfile
            .notificationMessages.unableToReportAccountDeleting + (
              resAccountDeleteReport.message ? (
                `\n${resAccountDeleteReport.message}`) : ""),
          type: "error"
        });
      }

      this.progress.ChangeType("success");
      this.progress.UpdateLabel(System.data.locale.common.done);
      this.deleteForm.submit();
    } catch (error) {
      console.error(error);
      notification({
        html: System.data.locale.userProfile.notificationMessages
          .unableToReportAccountDeleting,
        type: "error"
      });
    }
  }
  ShowProgress() {
    this.progress.$container.appendTo(this.progressContainer);
    this.container.append(this.progressContainer);
  }
  IsFormFilled() {
    return !!this.reasonMessage.value ||
      this.evidences.length > 0
  }
  /**
   * @param {DragEvent} event
   */
  ProcessFiles(event) {
    let files = this.fileInput.files;

    if (
      event &&
      event.dataTransfer &&
      event.dataTransfer.files
    ) {
      files = event.dataTransfer.files;

      this.HideAttachmentGrabber();
    }

    if (!files || files.length == 0)
      return

    for (let i = 0, file; file = files[i]; i++)
      this.ProcessFile(file);
  }
  /**
   * @param {File} file
   */
  ProcessFile(file) {
    if (file.size > System.constants.config.MAX_FILE_SIZE_OF_EVIDENCE)
      return notification({
        html: System.data.locale.userProfile.notificationMessages
          .fileSizeExceeded.replace("%{file_name}", file.name).replace(
            "%{file_size}",
            `${System.constants.config.MAX_FILE_SIZE_OF_EVIDENCE_IN_MB} MB`
          )
      });

    let fileExtension = file.name.split('.').pop();
    let isShortcut = /lnk|url|xnk/.test(fileExtension);

    if (
      isShortcut &&
      !confirm(System.data.locale.userProfile.notificationMessages
        .aShortcutFile)
    )
      return;

    let evidence = new Evidence(this, file);

    this.fileContainer.append(evidence.container);
    this.evidences.push(evidence);
  }
  SendFormDataToExtensionServer() {
    return new ServerReq().AccountDeleteReport(this.formData, this
      .UpdateUploadProgress.bind(this));
  }
  UpdateUploadProgress(event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;

    if (event.lengthComputable) {
      percent = position / total * 100;
    }

    this.progress.update(percent);
    this.progress.UpdateLabel(System.data.locale.userProfile.accountDelete
      .uploading.replace("%{percentage_value}", ` ${Math.ceil(percent)} `));
  }
  async PrepareForm() {
    this.formData = new FormData();
    let fileDetails = await this.PrepareFile();

    this.formData.append("comment", this.reasonMessage.value);
    this.formData.append("id", profileData.id + "");
    this.formData.append("nick", profileData.nick);
    this.formData.append("url", System.createProfileLink(profileData));

    if (fileDetails)
      this.formData.append("file", fileDetails.file, fileDetails.name);

    return Promise.resolve();
  }
  async PrepareFile() {
    let fileDetails;

    if (this.evidences.length == 1) {
      let file = this.evidences[0].file;
      fileDetails = {
        file,
        name: file.name
      }

    } else if (this.evidences.length > 1) {
      let file = await this.CompressStoredFiles();
      fileDetails = {
        file,
        name: `${profileData.nick}-${profileData.id}.zip`
      }
    }

    return Promise.resolve(fileDetails);
  }
  CompressStoredFiles() {
    let zip = new JSZip();

    this.evidences.forEach(evidence => {
      zip.file(evidence.file.name, evidence.file, { binary: true });
    });

    this.progress.UpdateLabel(System.data.locale.userProfile.accountDelete
      .compressingTheFiles);

    return zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      },
      streamFiles: true
    }, this.UpdateCompressingProgress.bind(this));
  }
  UpdateCompressingProgress(metadata) {
    this.progress.update(metadata.percent);

    if (metadata.currentFile) {
      this.progress.UpdateLabel(System.data.locale.userProfile.accountDelete
        .compressingTheFile.replace("%{file_name}",
          ` ${metadata.currentFile} `));
    }
  }
}
