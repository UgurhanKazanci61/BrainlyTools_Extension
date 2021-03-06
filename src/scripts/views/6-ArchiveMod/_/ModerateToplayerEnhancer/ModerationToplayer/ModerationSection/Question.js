import ModerationSection from ".";
import Action from "@/scripts/controllers/Req/Brainly/Action";

export default class QuestionSection extends ModerationSection {
  /**
   * @param {import("..").default} main
   */
  constructor(main) {
    super(main, main.question);

    this.contentType = "question";

    this.RenderDeleteButtons({
      type: "solid-mustard",
    });
  }
  Delete(data) {
    data.return_points = !data.give_warning;

    return new Action().RemoveQuestion(data);
  }
  Deleted() {
    super.Deleted();
    this.main.zdnObject.endModeration(false, System.data.locale.moderateAll
      .notificationMessage.questionRemovedPanelClosing, 4000, true);
    System.log(5, {
      user: this.main.zdnObject.data.user,
      data: [this.data.id],
    });
  }
}
