import Dropdown from "../../../../components/Dropdown";
import Modal from "../../../../components/Modal";
import notification from "../../../../components/notification";
import Action from "../../../../controllers/Req/Brainly/Action";
import ServerReq from "@ServerReq";
import renderGroupLi from "./groupLi";
import rankSelector from "./rankSelector";
import userLi from "./userLi";
import userSearch from "./userSearch";
import Button from "../../../../components/Button";

let System = require("../../../../helpers/System");

class GroupModal {
  constructor(group, groupLi) {
    if (typeof System == "function")
      System = System();

    this.locale = System.data.locale.messages.groups;
    this.group = group;
    this.groupLi = groupLi;

    this.Render();
    this.RenderSaveButton();
    this.RenderSaveButtonSpinner();
    this.RenderRemoveAllButton();
    this.RenderAddAllButton();
    this.OpenModal();
    this.BindHandlers();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  async Render() {
    //if (true) {
    let title = this.locale.createGroup;

    if (this.group)
      title = this.locale.editGroup;

    this.modal = new Modal({
      header: `
      <div class="sg-actions-list sg-actions-list--no-wrap">
				<div class="sg-actions-list__hole">
					<h2 class="sg-header-secondary">${title}</h2>
				</div>
				<div class="sg-actions-list__hole sg-actions-list__hole--to-right">
					<div class="sg-spinner-container"></div>
				</div>
			</div>`,
      content: `
      <div class="sg-actions-list sg-actions-list--space-between group-header sg-content-box__content--spaced-bottom">
				<div class="sg-actions-list__hole">
					<div class="sg-actions-list sg-actions-list--space-between sg-actions-list--no-wrap">
						<div class="sg-actions-list__hole">
							<label class="sg-text sg-text--xxlarge js-first-letter"${this.group?` style="color:${this.group.color};"`:""}>G</label>
						</div>
						<div class="sg-actions-list__hole">
							<div class="color-container" title="${this.locale.groupColor}">
								<datalist id="flatColors">
									<option value="#1abc9c">Turquoise</option><option value="#2ecc71">Emerland</option><option value="#3498db">Peterriver</option><option value="#9b59b6">Amethyst</option><option value="#34495e">Wetasphalt</option><option value="#16a085">Greensea</option><option value="#27ae60">Nephritis</option><option value="#2980b9">Belizehole</option><option value="#8e44ad">Wisteria</option><option value="#2c3e50">Midnightblue</option><option value="#f1c40f">Sunflower</option><option value="#e67e22">Carrot</option><option value="#e74c3c">Alizarin</option><option value="#ecf0f1">Clouds</option><option value="#95a5a6">Concrete</option><option value="#f39c12">Orange</option><option value="#d35400">Pumpkin</option><option value="#c0392b">Pomegranate</option><option value="#bdc3c7">Silver</option><option value="#7f8c8d">Asbestos</option>
								</datalist>
								<input id="colorPicker" list="flatColors" type="color" placeholder="Text input" value="${this.group?this.group.color:"#000000"}">
							</div>
						</div>
						<div class="sg-actions-list__hole">
							<input type="text" class="sg-input sg-input--light-alt sg-input--full-width sg-input--large js-group-name" placeholder="${this.locale.groupName}"${this.group?` style="color:${this.group.color};" value="${this.group.title}"`:""}>
						</div>
					</div>
				</div>
				<div class="sg-actions-list__hole">
					<div class="sg-actions-list sg-actions-list--space-between sg-actions-list--no-wrap user-category-selector">
						<div class="sg-actions-list__hole sg-box--full"></div>
					</div>
				</div>
			</div>
			<div class="sg-card sg-card--vertical sg-card--full  sg-card--padding-small">
				<div class="sg-card__hole sg-card__hole--lavender-secondary-light">
					<div class="sg-actions-list sg-actions-list--space-between">
						<div class="sg-actions-list__hole">
							<h2 class="sg-headline sg-headline--normal sg-headline--gray sg-headline--justify">${this.locale.groupMembers}</h2>
						</div>
						<div class="sg-actions-list__hole"></div>
					</div>
					<ul class="sg-list sg-list--spaced-elements"></ul>
				</div>
				<div class="sg-card__hole">
					<div class="sg-actions-list sg-actions-list--space-between">
						<div class="sg-actions-list__hole">
							<h2 class="sg-headline sg-headline--normal sg-headline--gray sg-headline--justify">${this.locale.searchResults}</h2>
						</div>
						<div class="sg-actions-list__hole"></div>
					</div>
					<ul class="sg-list sg-list--spaced-elements"></ul>
				</div>
			</div>`,
      size: "limited-width"
    });
    //}
    this.$saveButtonContainer = $(".sg-spinner-container", this.modal.$header);
    this.$groupMembersContainerHole = $(".sg-card__hole:nth-child(1)", this.modal.$content);
    this.$searchResultsContainerHole = $(".sg-card__hole:nth-child(2)", this.modal.$content);
    this.$removeAllButtonContainer = $(".sg-actions-list__hole:nth-child(2)", this.$groupMembersContainerHole);
    this.$addAllButtonContainer = $(".sg-actions-list__hole:nth-child(2)", this.$searchResultsContainerHole);
    this.$firstLetter = $(".js-first-letter", this.modal.$content);

    this.$closeIcon = $(".sg-toplayer__close", this.modal.$modal);
    this.$closeIconSVG = $("svg", this.$closeIcon);

    this.$color = $("input#colorPicker", this.modal.$content);
    this.$groupName = $("input.js-group-name", this.modal.$modal);
    this.$userCategorySelectorContainer = $(".group-header > div.sg-actions-list__hole > div.user-category-selector", this.modal.$modal);

    this.$groupMembersList = $("> ul", this.$groupMembersContainerHole);
    this.$searchResultsList = $("> ul", this.$searchResultsContainerHole);
    this.$removeAll = $("> .sg-actions-list button", this.$groupMembersContainerHole);
    this.$addAll = $("> .sg-actions-list button", this.$searchResultsContainerHole);

    this.$userCategoryList = Dropdown({
      label: this.locale.selectGroupType,
      class: "sg-dropdown--full-width",
      items: [{
          value: "findUsers",
          text: this.locale.userCategories.findUsers.text
        },
        {
          value: "moderatorRanks",
          text: this.locale.userCategories.moderatorRanks.text
        },
        {
          value: "allModerators",
          text: this.locale.userCategories.allModerators
        },
        {
          value: "friendsList",
          text: this.locale.userCategories.friendsList
        }
      ]
    });

    this.$userCategoryList.appendTo($(".sg-actions-list__hole", this.$userCategorySelectorContainer));

    /**
     * Prepare modal for updating
     */
    if (this.group) {
      let idList = this.group.members.map(member => ~~member.brainlyID);

      this.$groupName.trigger("input");
      let user = await new Action().GetUsers(idList);

      if (user && user.success && user.data.length > 0) {
        user.data.forEach(({ id, nick, avatar, ranks_ids }) => {
          let buddyUrl = System.createBrainlyLink("profile", { nick, id });
          avatar = System.prepareAvatar(avatar);
          let ranks = [];

          if (ranks_ids && ranks_ids.length > 0) {
            ranks_ids.forEach(rankId => {
              ranks.push(System.data.Brainly.defaultConfig.config.data.ranksWithId[rankId]);
            });
          }

          let $li = userLi({
            id,
            nick,
            avatar,
            buddyUrl,
            ranks
          }, true);

          this.$groupMembersList.append($li);
        });
      }
    }
  }
  RenderSaveButton() {
    this.$saveButton = Button({
      type: "solid-blue",
      size: "small",
      text: System.data.locale.common.save
    });

    this.$saveButton.prependTo(this.$saveButtonContainer);
  }
  RenderSaveButtonSpinner() {
    this.$saveButtonSpinner = $(`<div class="sg-spinner-container__overlay"><div class="sg-spinner sg-spinner--xsmall"></div></div>`);
  }
  RenderRemoveAllButton() {
    this.$removeAllButton = Button({
      type: "solid-blue",
      size: "small",
      text: System.data.locale.common.removeAll
    });

    this.$removeAllButton.appendTo(this.$removeAllButtonContainer);
  }
  RenderAddAllButton() {
    this.$addAllButton = Button({
      type: "solid-blue",
      size: "small",
      text: this.locale.addAll
    });

    this.$addAllButton.appendTo(this.$addAllButtonContainer);
  }
  OpenModal() {
    this.modal.Open();
  }
  BindHandlers() {
    let that = this;
    /**
     * Modal close
     */
    window.addEventListener("beforeunload", () => {
      if (this.modal.isOpen) {
        let $newUsers = $("> li.new-user[data-user-id]", this.$groupMembersList);

        if (this.$groupName.val() != this.$groupName.prop("defaultValue") || $newUsers.length > 0) {
          event.returnValue = System.data.locale.common.notificationMessages.ongoingProcess;

          event.preventDefault();
        }
      }
    });

    /**
     * Add and Remove all buttons
     */
    this.$addAll.click(this.AddAllUsersToGroupMembersList.bind(this));
    this.$removeAll.click(this.RemoveAllUsersToGroupMembersList.bind(this));

    /**
     * Save button
     */
    this.$saveButton.click(this.SaveGroup.bind(this));

    /**
     * Close button
     */
    this.$closeIcon.click(this.CloseModal.bind(this));

    /**
     * Bind the jQuery UI Sortable
     */
    let sortableOptions = {
      connectWith: ".sg-list",
      snap: this.$searchResultsList,
      snapMode: "inner",
      revert: true,
      start: (e, ui) => {
        if ($(ui.item).parents(".sg-card__hole:nth-child(1) > ul").length == 0) {
          let userID = $(ui.item).attr("data-user-id");

          if ($(`> li[data-user-id="${userID}"]`, this.$groupMembersList).length > 0) {
            $(ui.item).remove();
            this.modal.notification(this.locale.notificationMessages.alreadyExist, "error");
          }
        }
      }
    }

    this.$searchResultsList.sortable(sortableOptions).disableSelection();
    this.$groupMembersList.sortable(sortableOptions).disableSelection();

    /**
     * Group name input
     */
    let groupNameInputHandler = function() {
      let firstLetter = "G";
      let value = this.value && this.value.trim();

      if (value && value.length > 0) {
        firstLetter = value.charAt(0).toLocaleUpperCase(System.data.Brainly.defaultConfig.user.ME.user.isoLocale.replace("_", "-"));
      }

      this.$firstLetter.text(firstLetter);
    };
    this.$groupName.on({
      input: groupNameInputHandler,
      blur: function() {
        this.value = this.value.trim();
      }
    });

    /**
     * Group color picker
     */
    let colorChangeHandler = function() {
      let color = { color: this.value };

      this.$firstLetter.css(color);
      that.$groupName.css(color);
    }
    this.$color.change(colorChangeHandler);

    /**
     * User category list
     */
    let $subActionListHole;
    let userCategoryListHandler = function() {
      if ($subActionListHole) {
        $subActionListHole.remove();

        $subActionListHole = undefined;
      }

      that.$searchResultsList.html("");

      if (this.value == "findUsers") {
        $subActionListHole = $(`<div class="sg-actions-list__hole sg-box--full"></div>`);
        let $input = userSearch(that.$searchResultsList);

        $input.appendTo($subActionListHole);
        $subActionListHole.appendTo(that.$userCategorySelectorContainer);
        //$userCategoryList.removeClass("sg-dropdown--full-width");
      } else if (this.value == "moderatorRanks") {
        $subActionListHole = $(`<div class="sg-actions-list__hole sg-box--full"></div>`);
        let $input = rankSelector(that.$searchResultsList);

        $input.appendTo($subActionListHole);
        $subActionListHole.appendTo(that.$userCategorySelectorContainer);
        //$userCategoryList.removeClass("sg-dropdown--full-width");
      } else {
        if (this.value == "allModerators") {
          System.allModerators.list.forEach(({ id, nick, avatar, ranks_ids }) => {
            avatar = System.prepareAvatar(avatar);
            let buddyUrl = System.createBrainlyLink("profile", { nick, id });
            let ranks = [];

            ranks_ids.forEach(rankId => {
              ranks.push(System.data.Brainly.defaultConfig.config.data.ranksWithId[rankId]);
            });

            let $li = userLi({
              id,
              nick,
              avatar,
              buddyUrl,
              ranks
            });

            that.$searchResultsList.append($li);
          });
        }
        if (this.value == "friendsList") {
          System.friends.forEach(({ id, nick, buddyUrl, avatar, ranks }) => {
            avatar = System.prepareAvatar(avatar);

            if (ranks && ranks.names && ranks.names.length > 0) {
              ranks = ranks.names.map(rank => {
                return System.data.Brainly.defaultConfig.config.data.ranksWithName[rank];
              });
            }

            let $li = userLi({
              id,
              nick,
              avatar,
              buddyUrl,
              ranks
            });

            that.$searchResultsList.append($li);
          });
        }
      }
    };

    this.$userCategoryList.on("change", userCategoryListHandler);

  }
  AddAllUsersToGroupMembersList() {
    let $users = $(">li", this.$searchResultsList);

    $users.each((i, userLi) => {
      if ($(`li[data-user-id="${userLi.dataset.userId}"]`, this.$groupMembersList).length == 0) {
        $(userLi).appendTo(this.$groupMembersList);
      } else {
        userLi.remove();
      }
    });
  }
  RemoveAllUsersToGroupMembersList() {
    let $users = $(">li", this.$groupMembersList);

    if ($users.length > 0 && confirm(this.locale.notificationMessages.doYouWantToRemoveMembers)) {
      this.$searchResultsList.html("");

      $users.appendTo(this.$searchResultsList);
    }
  }
  SaveGroup() {
    let $groupMembersLi = $("> li[data-user-id]", this.$groupMembersList);
    this.$newGroupMembersLi = $("> li.new-user[data-user-id]", this.$groupMembersList);
    let groupData = {
      color: this.$color.val(),
      title: this.$groupName.val().trim(),
      members: []
    };

    this.ShowSaveButtonSpinner();
    this.$saveButton.Disable();
    this.$closeIcon.off("click");

    if (this.group) {
      if ($groupMembersLi.length == 0) {
        notification(this.locale.notificationMessages.youNeedToAddMembers, "info");
      } else {

        console.log(this.group);
        $groupMembersLi.each((i, li) => {
          let brainlyID = li.dataset.userId;
          let member = this.group.members.find(member => member.brainlyID == brainlyID);

          if (member) {
            console.log("checkAddedDateofConversationId:", member);
            groupData.members.push(member);
          } else {
            groupData.members.push({
              brainlyID
            });
          }
        });

        this.group.title = groupData.title;
        this.group.members = groupData.members;
        this.group.color = groupData.color;
        this.UpdateGroup(groupData);
      }
    } else if ((this.$newGroupMembersLi.length > 0)) {
      this.$newGroupMembersLi.each(function(i, li) {
        let brainlyID = li.dataset.userId;

        groupData.members.push({
          brainlyID
        });
      });
      this.CreateGroup(groupData);
    } else {
      this.modal.notification(this.locale.notificationMessages.youNeedToAddMembers, "info");
      this.HideSaveButtonSpinner();
      this.$saveButton.Enable();
      this.$closeIcon.click(this.CloseModal.bind(this));
    }
  }
  ShowSaveButtonSpinner() {
    this.$saveButtonSpinner.appendTo(this.$saveButtonContainer);
  }
  HideSaveButtonSpinner() {
    this.HideElement(this.$saveButtonSpinner);
  }
  /**
   * @param {JQuery<HTMLElement>} $element
   */
  HideElement($element) {
    if ($element)
      $element.appendTo("<div/>");
  }
  async CreateGroup(groupData) {

    let resCreatedGroup = await new ServerReq().CreateMessageGroup(groupData);

    if (!resCreatedGroup || !resCreatedGroup.success) {
      this.$saveButton.Enable();
      this.HideSaveButtonSpinner()
      this.$closeIcon.click(this.CloseModal.bind(this));
      this.modal.notification(this.locale.notificationMessages.cantCreate, "error");
      this.reject("Can't create group");
    } else {
      groupData.time = Date();
      groupData.pinned = false;
      groupData._id = resCreatedGroup.data._id;

      this.resolve(groupData);
      this.CloseModal(true);
      notification(this.locale.notificationMessages.groupCreated.replace("%{groupName}", ` ${groupData.title} `), "success");
    }
  }
  async UpdateGroup(groupData) {
    let resUpdatedGroup = await new ServerReq().UpdateMessageGroup(this.group._id, groupData);

    if (!resUpdatedGroup || !resUpdatedGroup.success) {
      this.modal.notification(this.locale.notificationMessages.cantCreate, "error");
    } else {
      let $groupLi = renderGroupLi(this.group);

      $groupLi.insertAfter(this.groupLi);
      this.groupLi.remove();

      this.$groupName.prop("defaultValue", groupData.title);

      this.modal.notification(this.locale.notificationMessages.groupUpdated.replace("%{groupName}", ` ${groupData.title} `), "success");
    }

    this.HideSaveButtonSpinner();
    this.$saveButton.Enable();
    this.$closeIcon.click(this.CloseModal.bind(this));
    this.$newGroupMembersLi.removeClass("new-user");
  }
  async CloseModal(forceClose) {
    let $newUsers = $("> li.new-user[data-user-id]", this.$groupMembersList);
    let $spinner = $(`<div class="sg-spinner sg-spinner--xxsmall"></div>`);

    $spinner.insertBefore(this.$closeIconSVG);
    this.$closeIconSVG.hide();
    this.$closeIcon.off("click");

    await System.Delay(50);

    if (
      forceClose == true ||
      (
        (
          this.$groupName.val() == this.$groupName.prop("defaultValue") && $newUsers.length == 0
        ) ||
        confirm(System.data.locale.common.notificationMessages.unsavedChanges)
      )
    ) {
      this.reject();
      this.modal.Close();
    } else {
      $spinner.remove();
      this.$closeIconSVG.show();
      this.$closeIcon.click(this.CloseModal.bind(this));
    }
  }
}
export default GroupModal
