# Drafts screen on Android

> Drafts screen on Android

# Drafts screen on Android

Guide to integrating and customizing drafts screen on Video Editor SDK.

## Configuration

Drafts are enabled by default, asks the user to save a draft before leave any VideoEditor screen. If you need to change drafts configuration you should add the code below in the [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L60):

 ```kotlin
     override val draftConfig: BeanDefinition<DraftConfig> = factory(override = true) {
         DraftConfig.ENABLED_ASK_TO_SAVE
     }
 ```

You can choose one of these options:

1. `ENABLED_ASK_TO_SAVE` - drafts enabled, asks the user to save a draft
2. `ENABLED_ASK_IF_SAVE_NOT_EXPORT` - drafts enabled, asks the user to save a draft without export
3. `ENABLED_SAVE_BY_DEFAULT` - drafts enabled, saved by default without asking the user
4. `DISABLED` - disabled drafts

## Draft Helper

```DraftsHelper``` interface is used for managing drafts.

``` kotlin
interface DraftsHelper {

    val allDrafts: StateFlow<List<Draft>>

    fun delete(draft: Draft)

    fun deleteAll()

    fun openDraft(draft: Draft): Intent

    fun openLastDraft(): Intent
}
```

To get the instance of ```DraftsHelper``` use the following in your Fragment or Activity.

``` kotlin
val draftsHelper: DraftsHelper by inject()
```

### Used string resources

| ResourceId | Value |
|:----------:|:-----:|
|drafts_title|Drafts|
|drafts_empty_description|No Drafts|
|drafts_options_edit|Edit|
|drafts_options_delete|Delete|
|editor_trim_video|Adjust Clips|
|editor_discard_changes|Discard changes|
|editor_update_draft|Update draft|
