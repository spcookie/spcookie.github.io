---
title: 了解Gradle kotlin DSL
categories: [ 工具 ]
tags: [ gradle, kotlin ]
comments: false
keywords:
description:
author: Spcookie
group: default
date: 2023/10/8 13:15:00
updated: 2023/10/8 13:15:00
readmore: false
copyright:
  type: type4
  author: 未知
---

## Gradle的特点

1.
Gradle构建脚本采用Groovy或Kotlin语言编写，如果采用Groovy编写，构建脚本后缀为.gradle，在里面可以使用Groovy语法，如果采用Kotlin编写，构建脚本后缀为.gradle.kts，在里面可以使用Kotlin语法。

2.
因为Groovy或Kotlin都是面向对象语言，所以在Gradle中处处皆对象，Gradle的.gradle或.gradle.kts脚本本质上是一个Project对象，在脚本中一些带名字的配置项如buildscript、allprojects等本质上就是对象中的方法，而配置项后面的闭包`{}`
就是参数，所以我们在使用这个配置项时本质上是在调用对象中的一个方法。

3. 在Groovy或Kotlin中，函数和类一样都是一等公民，它们都提供了很好的闭包`{}`
   支持，所以它们很容易的编写出具有[DSL](https://link.juejin.cn?target=https%3A%2F%2Fzh.wikipedia.org%2Fwiki%2F%25E9%25A2%2586%25E5%259F%259F%25E7%2589%25B9%25E5%25AE%259A%25E8%25AF%25AD%25E8%25A8%2580)
   风格的代码，用DSL编写构建脚本的Gradle比其他采用xml编写构建脚本的构建工具如maven、Ant等的可读性更强，动态性更好，整体更简洁。

4.
Gradle中主要有Project和Task对象，Project是Gradle中构建脚本的表示，一个构建脚本对应一个Project对象，Task是Gradle中最小的执行单元，它表示一个独立的任务，Project为Task提供了执行的上下。

## Gradle项目包含的文件

### build.gradle

它表示Gradle的项目构建脚本，在里面我们可以通过Groovy来编写脚本，在Gradle中，一个build.gradle就对应一个项目，build.gradle放在Gradle项目的根目录下，表示它对应的是根项目，build.gradle放在Gradle项目的其他子目录下，表示它对应的是子项目，Gradle构建时会为每一个build.gradle创建一个对应的Project对象，这样编写build.gradle时就可以使用Project接口中的方法。

### settings.gradle

它表示Gradle的多项目配置脚本，存放在Gradle项目的根目录下，在里面可以通过include来决定哪些子项目会参与构建，Gradle构建时会为settings.gradle创建一个对应的Settings对象，include也只是Settings接口中的一个方法。

### Gradle Wrapper

`gradle init`
执行时会同时执行wrapper任务，wrapper任务会创建gradle/wrapper目录，并创建gradle/wrapper目录下的gradle-wrapper.jar、gradle-wrapper.properties这两个文件，还同时创建gradlew、gradlew.bat这两个脚本，它们统称为Gradle
Wrapper，是对Gradle的一层包装。

Gradle Wrapper的作用就是可以让**你的电脑在不安装配置Gradle环境**的前提下运行Gradle项目，通过Gradle构建项目时，Gradle
Wrapper就会从指定下载位置下载Gradle，并解压到电脑的指定位置，在Gradle项目的命令行中运行gradlew或gradlew.bat脚本来使用gradle命令，要运行gradle
-v命令，在linux平台下只需要运行`./gradlew -v`，在window平台下只需要运行`gradlew -v`，只是把`gradle`替换成`gradlew`。

Gradle Wrapper的每个文件含义如下：

1. gradlew：用于在linux平台下执行gradle命令的脚本；

2. gradlew.bat：用于在window平台下执行gradle命令的脚本；

3. gradle-wrapper.jar：包含Gradle Wrapper运行时的逻辑代码；

4. gradle-wrapper.properties：用于指定Gradle的下载位置和解压位置；

gradle-wrapper.properties中各个字段解释如下：

| 字段名              | 解释                                                                                                                                          |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| distributionBase | 下载的Gradle的压缩包解压后的主目录，为GRADLE\_USER\_HOME，在window中它表示**C:/用户/你电脑登录的用户名/.gradle/**，在mac中它表示**～/.gradle/**                                     |
| distributionPath | 相对于distributionBase的解压后的Gradle的路径，为wrapper/dists                                                                                            |
| distributionUrl  | Grade压缩包的下载地址，在这里可以修改下载的Gradle的版本和版本类型(binary或complete)，例如gradle-6.5-all.zip表示Gradle 6.5的complete版本，gradle-6.5-bin.zip表示Gradle 6.5的binary版本 |
| zipStoreBase     | 同distributionBase，不过是表示存放下载的Gradle的压缩包的主目录                                                                                                  |
| zipStorePath     | 同distributionPath，不过是表示存放下载的Gradle的压缩包的路径                                                                                                   |

## Gradle的多项目配置

下面是目录结构：

```bash
project:.
|   settings.gradle.kts
|
+---subproject-1
|       build.gradle.kts
|
+---subproject-2
|       build.gradle.kts
|
\---subproject-3
        build.gradle.kts
```

settings.gradle.kts的内容如下：

```kotlin
rootProject.name = "prject"
includ("subproject-1")
includ("subproject-2")
includ("subproject-3")
```

配置多项目时，Gradle的Project接口为我们提供了`allprojects`和`subprojects`
方法，在根项目的build.gradle中使用这两个方法可以全局的为所有子项目进行配置，`allprojects`和`subprojects`
的区别是：`allprojects`的配置包括根项目而`subprojects`的配置不包括根项目。

```kotlin
//根项目的build.gradle.kts

//为所有项目添加maven仓库地址
allprojects {
    repositories {
        mavenCentral()
    }
}

//为所有子项目添加kotlin插件
subprojects {
    apply {
        plugin("org.jetbrains.kotlin.jvm")
    }
}
```

## Gradle构建的生命周期

当在命令行输入`gradle build`构建整个项目或`gradle task`名称执行某个任务时就会进行Gradle的构建，它的构建过程分为3个阶段：

**init(初始化阶段)** -> **configure(配置阶段)** -> **execute(执行阶段)**

**init：**初始化阶段主要是解析settings.gradle，生成Settings对象，确定哪些项目需要参与构建，为需要构建的项目创建Project对象；

**configure：**
配置阶段主要是解析build.gradle，配置init阶段生成的Project对象，构建根项目和所有子项目，同时生成和配置在build.gradle中定义的Task对象，构造Task的关系依赖图，关系依赖图是一个有向无环图；

**execute：**根据configure阶段的关系依赖图执行Task。

Gradle在上面3个阶段中每一个阶段的开始和结束都会有一些钩子函数，暴露给开发者使用，方便开发者在Gradle的不同生命周期阶段做一些事情。

settings.gradle和build.gradle分别代表Settings对象和Project对象，它们都有一个Gradle对象，我们可以在Gradle项目根目录的settings.gradle或build.gradle中获取到Gradle对象，然后进行生命周期监听。以下是Gradle对象上的生命周期方法：

* buildStarted：构建开始

* settingsEvaluated：settings.gradle解析完成（init开始）

* projectsLoaded ：所有项目从settings加载完成

* beforeProject：项目开始构建（configure开始，每一个项目构建之前被调用）

* beforeEvaluate：项目开始构建

* afterEvaluate：项目构建完成

* afterProject：项目构建完成（每一个项目构建完成被调用）

* projectsEvaluated：所有项目构建完成

* taskGraph.whenReady：task图构建完成

* taskGraph.beforeTask：task开始执行（execute开始，每个task开始执行时会调用这个方法）

* taskGraph.afterTask：task执行完成（每个task执行结束时会调用这个方法）

* buildFinished：Gradle构建结束

{% noteblock warning:: %}
Gradle的buildStarted方法永远不会被回调，因为我们注册监听的时机太晚了，当解析settings.gradle或build.gradle时，Gradle就已经构建开始了，所以这个方法也被Gradle标记为废弃的了，因为我们没有机会监听到Gradle构建开始，同时如果你是在build.gradle中添加上面的所有监听，那么Gradle的settingsEvaluated和projectsLoaded方法也不会被回调，因为settings.gradle的解析是在build.gradle之前，在build.gradle中监听这两个方法的时机也太晚了。

在根项目的build.gradle添加上述方法，其beforeEvaluate方法是无法被回调的，因为注册时机太晚，解析根项目的的build.gradle时根项目已经开始构建了，但是子项目的build.gradle添加上述方法是可以监听到项目构建的开始和结束，因为根项目构建完成后才会轮到子项目的构建
{% endnoteblock %}

## Task

### 定义Task

Task是Gradle中最小执行单元，它是一个接口，默认实现类为DefaultTask，在Project中提供了task方法来创建Task，所以Task的创建必须要处于Project上下文中，可以用register注册、create创建任务。

```kotlin
tasks.register("hello") {
   doFirst {
       println("hello")
   }
}
 
tasks.register("copy") {
    from(file("srcDir"))
    into("buildDir")
}

tasks.register("copy", Copy::class) {
    from(file("srcDir"))
    into("buildDir")
}

tasks.create("hello") {
   doLast {
       println("hello")
   }
}
 
tasks.create("copy") {
    from(file("srcDir"))
    into("buildDir")
}

tasks.create("copy", Copy::class) {
    from(file("srcDir"))
    into("buildDir")
}

// 通过kotlin的属性委托注册
val hello by tasks.registering
hello {
    doLast {
        println("hello")
    }
}

val copy by tasks.registering(Copy::class) {
    from(file("srcDir"))
    into("buildDir")
}
```

其中`doFirst`方法会在Task的action执行前执行，`doLast`方法会在Task的action执行后执行，而`action`就是Task的执行单元，在后面自定义Task说明。

上面通过Project的`register`和`create`方法创建的Task默认被放在Project的`TaskContainer`
类型的容器中，我们可以通过Project的`getTasks`方法获取到这个容器。

> **register与create的区别**
>
> 通过`register`创建时，只有在这个task被需要时才会真正创建与配置该Task（被需要是指在本次构建中需要执行该Task）
>
> 通过`create`创建时，则会立即创建与配置该Task。

创建Task之后，就可以执行它，执行一个Task只需要把task名称接在`gradle`命令后。如果要执行多个Task，多个task名称接在`gradle`
命令后用空格隔开就行。

### 查找Task

我们有时需要查找Task，比如需要配置或者依赖某个Task，我们可以通过`named`方法来查找对应名字的task：

```kotlin
// 通过名称查找
tasks.named("hello").get()
tasks.named("copy").get()

// 通过指定类型查找
tasks.withType()
```

### 配置Task

Gradle为每个Task定义了默认的属性Property， 比如`description`、`group`、`dependsOn`、`inputs`、`outputs`等,
我们可以配置这些Property。Gradle在执行一个Task之前，会先配置这个Task的Property，然后再执行这个Task的执行代码块，所以配置Task的代码块放在哪里都无所谓。

```kotlin
// 在查找到Task之后进行配置
tasks.named("copy") {
    group.set("demo.copy")
    descriotion.set("这是一个复制任务")

    from("resources")
    into("target")
    include("**/*.txt", "**/*.xml", "**/*.properties")
}

// 将Task引用存储在变量中(kotlin的属性委托)，并用于稍后在脚本中进一步配置任务
val copy by tasks.existing(Copy::class) {
    from("resources")
    into("target")
}
myCopy {
    include("**/*.txt", "**/*.xml", "**/*.properties")
}

// 在定义Task时进行配置，这也是最常用的一种
tasks.register("copy") {
   from("resources")
   into("target")
   include("**/*.txt", "**/*.xml", "**/*.properties")
}
```

可以通过Task的dependsOn属性指定Task之间的依赖关系：

```kotlin
// 通过名称定义依赖项
tasks.register("taskY") {
    doLast {
        println("taskY")
    }
}

tasks.register("taskX") {
    dependsOn("taskY")
        doLast {
            println("taskX")
        }
}

// 通过Task对象定义依赖项
val taskX by tasks.registering {
    doLast {
        println("taskX")
    }
}
 
val taskY by tasks.registering {
    doLast {
        println("taskY")
    }
}
 
taskX {
    dependsOn(taskY)
}
```

### 排序Task

有时候，两个task之间没有依赖关系，但是对两个task的执行顺序却有所要求，任务排序和任务依赖之间的主要区别在于，排序规则不会影响将执行哪些任务，只会影响它们的执行顺序。

任务排序在许多场景中都很有用：

* 强制执行任务的顺序：例如，`build` 永远不会在`clean` 之前运行。

* 在构建的早期运行构建验证：例如，在开始发布构建工作之前验证我是否拥有正确的凭据。

* 通过在长时间验证任务之前运行快速验证任务来更快地获得反馈：例如，单元测试应该在集成测试之前运行。

* 聚合特定类型的所有任务的结果的任务：例如测试报告任务组合所有已执行测试任务的输出。

gradle提供了两个可用的排序规则：`mustRunAfter` 和 `shouldRunAfter`

当您使用`mustRunAfter`排序规则时，您指定taskB必须始终在taskA之后运行，这表示为`taskB.mustRunAfter(taskA)`

而`shouldRunAfter`规则理加弱化，因为在两种情况下这条规则会被忽略：

* 使用这条规则会导致先后顺序成环的情况；

* 当并行执行task，并且任务的所有依赖关系都已经满足时，那么无论它的`shouldRunAfter`排序关系是否已经运行，这个任务都会运行。

因此您应该在排序有帮助但不是严格要求的情况下使用`shouldRunAfter`。

### 跳过Task

gradle提供了多种方式来跳过task的执行。

#### 使用onlyIf

通过onlyIf为任务的执行添加条件，如果任务应该执行，则应该返回 true，如果应该跳过任务，则返回 false。

```kotlin

val hello by tasks.registering {
    doLast {
        println("hello world")
    }
}
 
hello {
    onlyIf { !project.hasProperty("skipHello") }
}
```

#### 使用 StopExecutionException

使用StopExecutionException。如果某个Action抛出此异常，则跳过该Action的进一步执行以及该任务的任何后续Action的执行。构建继续执行下一个任务。

```kotlin
val compile by tasks.registering {
    doLast {
        println("We are doing the compile.")
    }
}
 
compile {
    doFirst {
        // Here you would put arbitrary conditions in real life.
        if (true) {
            throw StopExecutionException()
        }
    }
}
tasks.register("myTask") {
    dependsOn(compile)
    doLast {
        println("I am not affected")
    }
}
```

#### 禁用与启用Task

每个任务都有一个enabled的标志位，默认为true。将其设置为false可以阻止执行任何Task的执行。禁用的任务将被标记为 SKIPPED。

```kotlin

val disableMe by tasks.registering {
    doLast {
        println("This should not be printed if the task is disabled.")
    }
}
 
disableMe {
    enabled = false
}
```

#### Task超时

每个Task都有一个timeout属性，可用于限制其执行时间。当一个任务达到它的超时时间时，它的任务执行线程被中断。该任务将被标记为失败。但是Finalizer
Task任务仍将运行。如果构建时使用了--continue参数，其他任务可以在它之后继续运行。不响应中断的task不能超时。Gradle
的所有内置task都会及时响应超时。

## 自定义Task

前面创建的Task默认都是DefaultTask类型，我们可以通过继承DefaultTask来自定义Task类型，Gradle中也内置了很多具有特定功能的Task，它们都间接继承自DefaultTask，如Copy(
复制文件)、Delete(文件清理)等，我们可以直接在build.gradle中自定义Task，如下：

```kotlin
class MyTask: DefaultTask {

    val message = "hello world from myCustomTask"

    @TaskAction
    fun println1(){
        println("println1: $message")
    }

    @TaskAction
    fun println2(){
        println("println2: $message")
    }
}
```

在MyTask中，通过`@TaskAction`
注解的方法就是该Task的action，action是Task最主要的组成，它表示Task的一个执行动作，当Task中有多个action时，多个action的执行顺序按照`@TaskAction`
注解的方法的放置逆顺序，所以执行一个Task的过程就是：doFirst方法 -> action方法 ->
doLast方法，在MyTask中定义了两个action，接下来我们使用这个Task，如下：

```kotlin
tasks.create("myTask") {
  message.set("custom message")
}
```

自定义的Task本质上就是一个类，除了直接在build.gradle文件中编写自定义Task，还可以在Gradle项目的根目录下新建一个buildSrc目录，在buildSrc/src/main/\[java/kotlin/groovy\]目录中定义编写自定义Task，可以采用java、kotlin、groovy三种语句之一，或者在一个独立的项目中编写自定义Task。

## Task支持增量编译

增量式构建就是**当Task的输入和输出没有变化时，跳过action的执行，当Task输入或输出发生变化时，在action中只对发生变化的输入或输出进行处理
**，这样就可以避免一个没有变化的Task被反复构建，还有当Task发生变化时只处理变化部分，这样就会提高整个Gradle的构建效率，大大缩短整个Gradle的构建时间。

让Task支持增量式构建只需要做到两步：

1. 让Task的inputs和outputs参与Gradle的Up-to-date检查；

2. 让Task的action支持增量式构建；

下面我们通过这两步自定义一个简单的、支持增量式构建的Copy任务，这个Copy任务的作用是把输入的文件复制到输出的位置中：

首先我们要让Copy任务的inputs和outputs参与Gradle的Up-to-date检查，每一个Task都有inputs和outputs属性，它们的类型分别为TaskInputs和TaskOutputs，Task的inputs和outputs主要有以下三种类型：

* 可序列化类型：可序列化类型是指实现了Serializable的类或者一些基本类型如int、string等；

* 文件类型：文件类型是指标准的java.io.File或者Gradle衍生的文件类型如FileCollection、FileSystemLocation等；

* 自定义类型：自定义类型是指自己定义的类，这个类含有Task的部分输入和输出属性，或者说任务的部分输入和输出属性嵌套在这个类中.

我们可以在自定义Task时通过**注解**
指定Task的inputs和outputs，通过注解指定的inputs和outputs会参与Gradle的Up-to-date检查，它是编写增量式Task的前提，Up-to-date检查是指Gradle每次执行Task前都会检查Task的输入和输出，如果一个Task的输入和输出自上一次构建以来没有发生变化，Gradle就判定这个Task是可以跳过执行的，这时你就会看到Task构建旁边会有一个
**UP-TO-DATE**文本，Gradle提供了很多注解让我们指定Task的inputs和outputs，**常用**的如下：

| 注解&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                                                                      | 对应的类型                      | 含义                                                                                                                                |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| @[Input](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FInput.html)                         | 可序列化类型                     | 指单个输入可序列化的值，如基本类型int、string或者实现了Serializable的类                                                                                    |
| @[InputFile](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FInputFile.html)                 | 文件类型                       | 指单个输入文件，不表示文件夹，如File、RegularFile等                                                                                                 |
| @[InputDirectory](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FInputDirectory.html)       | 文件类型                       | 指单个输入文件夹，不表示文件，如File、Directory等                                                                                                   |
| @[InputFiles](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FInputFiles.html)               | 文件类型                       | 指多个输入的文件或文件夹，如FileCollection、FileTree等                                                                                            |
| @[OutputFile](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FOutputFile.html)               | 文件类型                       | 指单个输出文件，不表示文件夹，如File、RegularFile等                                                                                                 |
| @[OutputDirectory](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FOutputDirectory.html)     | 文件类型                       | 指单个输出文件夹，不表示文件，如File、Directory等                                                                                                   |
| @[OutputFiles](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FOutputFiles.html)             | 文件类型                       | 指多个输出的文件，如FileCollection、Map等                                                                                                     |
| @[OutputDirectories](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FOutputDirectories.html) | 文件类型                       | 指多个输出的文件夹，如FileCollection、Map等                                                                                                    |
| @[Nested](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FNested.html)                       | 自定义类型                      | 指一种自定义的类，这个类它可能没有实现Serializable，但这个类里面至少有一个属性使用本表中的一个注解标记，即这个类会含有Task的输入或输出                                                       |
| @[Internal](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FInternal.html)                   | 任何类型                       | 它可以用在可序列化类型、文件类型、还有自定义类型上，它指该属性只在Task的内部使用，即不是Task的输入也不是Task的输出，通过@Internal注解的属性不参与Up-to-date检查                                   |
| @[Optional](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FOptional.html)                   | 任何类型                       | 它可以用在可序列化类型、文件类型、还有自定义类型上，它指该属性是可选的，通过@Optional注解的属性可以不为它赋值，关闭校验                                                                  |
| @[Incremental](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fwork%2FIncremental.html)                    | Provider 或者 FileCollection | 它和@InputFiles或@InputDirectory一起使用，它用来指示Gradle跟踪文件属性的更改，通过@Incremental注解的文件属性可以通过InputChanges的getFileChanges方法查询文件的更改，帮助实现增量构建Task |
| @[SkipWhenEmpty](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2Ftasks%2FSkipWhenEmpty.html)         | Provider 或者 FileCollection | 它和@InputFiles或@InputDirectory一起使用，它用来指示Gradle跟踪文件属性的更改，通过@Incremental注解的文件属性可以通过InputChanges的getFileChanges方法查询文件的更改，帮助实现增量构建Task |

我们自定义Task时可以使用表中的注解来指定输入和输出，其中@InputXX是用来指定输入属性，@OuputXX是用来指定输出属性，@Nested是用来指定自定义类，这个类里面至少含有一个使用@InputXX或@OuputXX指定的属性，而@Internal和@Optional是可以用来指定输入或输出的，最后的@Incremental和@SkipWhenEmpty是用来与@InputFiles或@InputDirectory一起使用的，用于支持增量式构建任务。

{% noteblock waring %}
这些注解只有声明在属性的get方法中才有效果，前面讲过groovy的字段默认都生成了get/set方法，而如果你是用java自定义Task的，要记得声明在属性的get方法中。
{% endnoteblock %}

我们来看Copy任务的实现，如下：

```kotlin
class CopyTask: DefaultTask {

  //使用@InputFiles注解指定输入
  @InputFiles
  lateinit var from: FileCollection

  //使用@OutputDirectory注解指定输出
  @OutputDirectory
  lateinit var to: Directory

  //复制过程：把from的文件复制到to文件夹
  @TaskAction
  fun execute() {
    File file = from.getSingleFile()
    if(file.isDirectory()){
      from.getAsFileTree().each {
        copyFileToDir(it, to)
      }
    }else{
      copyFileToDir(from, to)
    }
  }

  private fun copyFileToDir(File src, Directory dir){
    File dest = File("${dir.getAsFile().path}/${src.name}")
    if(!dest.exists()){
      dest.createNewFile()
    }
    dest.withOutputStream {
      it.write(FileInputStream(src).getBytes())
    }
  }
}
```

这里Copy任务只使用了@InputFiles和@OutputDirectory，通过@InputFiles指定Copy任务复制的来源文件，通过@OutputDirectory指定Copy任务复制的目标文件夹，然后在action方法中执行复制步骤。

```kotlin
// 使用这个任务
task.create("copyTask") {
  from = files("from")
  to = layout.projectDirectory.dir("to")
}
```

目前Copy任务已经支持Up-to-date检查，但还不支持增量构建要让Task的action方法支持增量式构建，只需要让action方法带一个InputChanges类型的参数就可以，带
**InputChanges**类型参数的action方法表示这是一个增量任务操作方法，该参数告诉Gradle，该action方法仅需要处理更改的输入，此外，Task还需要通过使用
**@Incremental或@SkipWhenEmpty**来指定至少一个增量文件输入属性。

```kotlin
class CopyTask: DefaultTask {

  //新增@Incremental注解
  @Incremental
  @InputFiles
  lateinit var from: FileCollection

  //使用@OutputDirectory注解指定输出
  @OutputDirectory
  lateinit var to: Directory

  //带有InputChanges类型参数的action方法
  @TaskAction
  fun executeIncremental(inputChanges: InputChanges) {
    println("execute: isIncremental = ${inputChanges.isIncremental()}")
    inputChanges.getFileChanges(from).each { change ->
      if(change.fileType != FileType.DIRECTORY){
        println("changeType = ${change.changeType}, changeFile = ${change.file.name}")
        if(change.changeType != ChangeType.REMOVED){
          copyFileToDir(change.file, to)
        }
      }
    }
  }

  private fun copyFileToDir(File src, Directory dir){
    File dest = File("${dir.getAsFile().path}/${src.name}")
    if(!dest.exists()){
      dest.createNewFile()
    }
    dest.withOutputStream {
      it.write(FileInputStream(src).getBytes())
    }
  }
}
```

Copy任务中通过@Incremental指定了需要增量处理的输入，然后在action方法中通过InputChanges进行增量复制文件，我们可以通过InputChanges的
**getFileChanges**
方法获取变化的文件，该方法接收一个FileCollection类型的参数，传入的参数必须要通过@Incremental或@SkipWhenEmpty注解，getFileChanges方法返回的是一个FileChange列表，FileChange持有变化的文件File、文件类型FileType和文件的变化类型ChangeType，这样我们就可以根据
**变化的文件、ChangeType、FileType**进行增量输出，ChangeType有三种取值：

* ADDED：表示这个文件是新增的；

* MODIFIED：表示这个文件被修改了；

* REMOVED：表示这个文件被删除了.

同时并不是每次执行都是增量构建，我们可以通过InputChanges的**isIncremental**方法判断本次构建是否是增量构建，当处于以下情况时，Task会以非增量形式即全量执行：

* 该Task是第一次执行；

* 该Task只有输入没有输出；

* 该Task的upToDateWhen条件返回了false；

* 自上次构建以来，该Task的某个输出文件已更改；

* 自上次构建以来，该Task的某个属性输入发生了变化，例如一些基本类型的属性；

* 自上次构建以来，该Task的某个非增量文件输入发生了变化，非增量文件输入是指没有使用@Incremental或@SkipWhenEmpty注解的文件输入。

当Task处于非增量构建时，即InputChanges的isIncremental方法返回false时，通过InputChanges的getFileChanges方法能获取到所有的输入文件，并且每个文件的ChangeType都为ADDED，当Task处于增量构建时，即InputChanges的isIncremental方法返回true时，通过InputChanges的getFileChanges方法能获取到只发生变化的输入文件。

## Finalizer Task

我们常常使用dependsOn来在一个task之前做一些工作，如果我们想要在task执行之后做一些操作可以用到finalizedBy方法。

```kotlin
val taskX by tasks.registering {
    doLast {
        println("taskX")
    }
}
val taskY by tasks.registering {
    doLast {
        println("taskY")
    }
}
 
taskX { finalizedBy(taskY) }
```

taskY将在taskX之后执行，需要注意的是finalizedBy并不是依赖关系，就算taskX执行失败，taskY也将正常执行。

## 自定义Plugin

Plugin可以理解为一系列Task的集合，通过实现Plugin接口的apply方法就可以自定义Plugin，自定义的Plugin本质上也是一个类，所以和Task类似，在Gradle中也提供了3种方式来编写自定义Plugin：

1、在build.gradle中直接编写：可以在任何一个build.gradle文件中编写自定义Plugin，此方式自定义的Plugin只对该build.gradle对应的项目可见；

2、在buildSrc目录下编写：可以在Gradle项目根目录的buildSrc/src/main/\[java/kotlin/groovy\]目录中编写自定义Plugin，可以采用java、kotlin、groovy三种语句之一，Gradle在构建时会自动的编译buildSrc/src/main/\[java/kotlin/groovy\]目录下的所有类文件为class文件，供本项目所有的build.gradle引用，所以此方式自定义的Plugin只对本Gradle项目可见；

3、在独立项目中编写：可以新建一个Gradle项目，在该Gradle项目中编写自定义Plugin，然后把Plugin源码打包成jar，发布到maven、lvy等托管平台上，这样其他项目就可以引用该插件，所以此方式自定义的Plugin对所有Gradle项目可见。

在buildSrc/src/main/kotlin/io.example.plugin下创建build.gradle.kts：

```kotlin
import org.gradle.api.*

class MyPlugin: Plugin{

    @Override
    fun apply(project: Project){
      //通过project的ExtensionContainer的create方法创建一个名为outerExt的扩展，扩展对应的类为OuterExt
      OuterExt outerExt = project.extensions.create("outerExt", OuterExt.class)

      //通过project的task方法创建一个名为showExt的Task
      project.task('showExt') {
        doLast{
          //使用OuterExt实例
          println("outerExt = ${outerExt}")
        }
      }
    }

  /**
   * 自定义插件的扩展对应的类
   */
    class OuterExt {

      String message

      @Override
      fun toString(): String {
        return "[message = ${message}]"
      }
    }
}
```

在apply方法中创建了一个扩展和一个Task，拓展是什么，在引用Java插件时有如下写法：

```kotlin
plugins {
    id("java")
  }

jar {
  enable.set(true)
  group.set("io.example")
}
```

它并不是一个名为jar的方法，它而是java插件中名为jar的扩展，该扩展对应一个bean类，该bean类中有enable、group等方法，所以配置jar就是在配置jar对应的bean类。MyPlugin也定义了一个bean类：OuterExt，该bean类有messag字段，Groovy会自动为我们生成messag的get/set方法，而apply方法中通过project实例的ExtensionContainer的create方法创建一个名为outerExt的扩展，扩展对应的bean类为OuterExt，扩展的名字可以随便起，其中ExtensionContainer类似于TaskContainer，它也是Project中的一个容器，这个容器存放Project中所有的扩展，通过ExtensionContainer的
**create**方法可以创建一个扩展，create方法返回的是扩展对应的类的实例。

```kotlin
plugins {
  id("io.example.plugin")
}

outerExt {
  message.set("hello")
}

//执行gradle showExt, 输出:
//outerExt = [message = hello]
```

嵌套DSL的实现：

```kotlin
package com.example.plugin

import org.gradle.api.*
import org.gradle.api.model.* 
import javax.inject.Inject

class MyPlugin: Plugin{

  @Override
  fun apply(project: Project) {

    OuterExt outerExt = project.extensions.create('outerExt', OuterExt.class)

    project.task('showExt'){
      doLast{
        //使用OuterExt实例和InnerExt实例
        println("outerExt = ${outerExt}, innerExt = ${outerExt.innerExt}")
      }
    }
  }

  abstract class OuterExt {

    lateinit var message: String

    //嵌套类
    lateinit var innerExt: InnerExt

    //定义一个使用@Inject注解的、抽象的获取ObjectFactory实例的get方法
    @Inject
    abstract fun getObjectFactory(): ObjectFactory

    init {
      //通过ObjectFactory的newInstance方法创建嵌套类innerExt实例
      this.innerExt = getObjectFactory().newInstance(InnerExt::class)
    }

    //定义一个方法，方法名为可以随意起，方法的参数类型为Action，泛型类型为嵌套类InnerExt
    fun inner(action: Action) {
      //调用Action的execute方法，传入InnerExt实例
      action.execute(innerExt)
    }

    @Override
    fun toString(): String {
      return "[message = ${message}]"
    }

    class InnerExt {

      String message

      @Override
      fun toString(): String {
        return "[message = ${message}]"
      }
    }
  }
}
```

使用MyPlugin就可以这样使用：

```kotlin
plugins {
  id("io.example.plugin")
}

outerExt {
  message.set("hello")

 `inner` {
    message.set("world")
  }
}

//执行gradle showExt, 输出:
//outerExt = [message = hello], innerExt = [message = word]
```

outerExt {}中嵌套了inner{}，其中inner是一个方法，参数类型为Action，Gradle内部会把inner方法后面的闭包配置给InnerExt类，这是Gradle中的一种转换机制，总的来说，定义嵌套DSL的大概步骤如下：

* 定义嵌套的DSL对应的bean类，如这里为InnerExt；

*
定义一个使用@Inject注解的、抽象的获取ObjectFactory实例的get方法，或者定义一个使用@Inject注解的带ObjectFactory类型参数的构造，@Inject是javax包下的，ObjectFactory是属于Gradle的model包下的类，当Gradle实例化OuterExt时，它会自动注入通过@Inject注解的实例，例如这里就自动注入了ObjectFactory实例，需要注意的是通过@Inject注解的方法或构造必须是public的；

* 在构造中通过ObjectFactory对象的newInstance方法来创建bean类实例，通过ObjectFactory实例化的对象可以被闭包配置；

* 定义一个方法，该方法的参数类型为Action，泛型类型为嵌套的DSL对应的bean类，方法名随便起，如这里为inner，然后在方法中调用Action的
  **execute**方法，传入bean类实例。