---
title: 单元测试框架-Mockito
cover: false
categories: [ 开发笔记 ]
tags: [ 测试, Mockito, Java]
keywords:
description:
author: 咸小鱼
group: default
date: 2024-8-27
updated: 2024-8-27
comments: true
readmore: false
---

Mockito 是一个功能强大的 Java 单元测试 Mocking 框架，本文将介绍 Mockito 的用法。

<!-- more -->


## Mockito 快速入门

快速使用

```java
import static org.mockito.Mockito.*;

// 创建mock对象
// 你可以mock具体的类型,不仅只是接口
List mockedList = mock(List.class);
// 对于高版本Mockito 4.10.0+，可以写的更简洁
// List mockedList = mock();

// 下面添加测试桩(stubbing)，指定mock的行为
// ”当“ 调用 mockedList.get(0) 返回 "first"
when(mockedList.get(0)).thenReturn("first");

// 下面代码将打印 "first"
System.out.println(mockedList.get(0));

// 下面将打印 "null"，因为 get(999) 没有被打桩
System.out.println(mockedList.get(999));
```

上面示例，首先我们使用 Mockito 中的 mock 静态方法创建 mock 对象。或使用 `@Mock` 注解。通过 `when()/given()` 指定 mock 行为。例如上面当调用 `mockedList.get(0)` 将返回 "first"，这一过程专业术语叫做“打桩”(stubbing)。

## Mockito 中的 @Mock, @Spy, @Captor 及 @InjectMocks 注解

### 启用 Mockito

开始之前，我们需要先使 Mockito 注解生效，有几种方法：

- **在 JUnit 上设置 MockitoJUnitRunner**

```java
@ExtendWith(MockitoExtension.class)
public class MockitoAnnotationUnitTest {
    ...
}
```

- **调用 MockitoAnnotations.openMocks() 方法**

```java
@Before
public void init() {
    MockitoAnnotations.openMocks(this);
}
```

- **使用 MockitoJUnit.rule()**

```java
public class MockitoAnnotationsInitWithMockitoJUnitRuleUnitTest {

    @Rule
    public MockitoRule initRule = MockitoJUnit.rule();

    ...
}
```

> 注意，这需要将 rule 设置为 public 。

### @Mock 注解

`@Mock` 是 Mockito 中用的最多的注解，我们用它来创建并注入 mock 对象，而不用手动调用 Mockito.mock 方法。

```java
@Mock
List<String> mockedList;

@Test
public void whenUseMockAnnotation_thenMockIsInjected() {
    mockedList.add("one");
    Mockito.verify(mockedList).add("one");
    assertEquals(0, mockedList.size());

    Mockito.when(mockedList.size()).thenReturn(100);
    assertEquals(100, mockedList.size());
}
```

mock 意思就是造一个假的模拟对象，不会去调用这个真正对象的方法，这个 mock 对象里的所有行为都是未定义的，属性也不会有值，需要你自己去定义它的行为。比如说，你可以 mock 一个假的 `size()` , 使其返回 100，但实际上并没有真的创建一个 size 为 100 的 `Map`。

### @DoNotMock 注解

@DoNotMock 注解用来标记不要mock的类或接口：

```java
import org.mockito.exceptions.misusing.DoNotMock;

@DoNotMock(reason = "Use a real instance instead")
public abstract class NotToMock {
    // Class implementation
}
```

### @Spy 注解

`@Spy` 注释用于创建一个真实对象并监视这个真实对象。`@Spy` 对象能够调用所监视对象的所有正常方法，同时仍然跟踪每一次交互，就像我们使用 mock 一样，可以自己定义行为。

```java
@Spy
List<String> spiedList = new ArrayList<String>();

@Test
public void whenUseSpyAnnotation_thenSpyIsInjectedCorrectly() {
    spiedList.add("one");
    spiedList.add("two");

    Mockito.verify(spiedList).add("one");
    Mockito.verify(spiedList).add("two");

    assertEquals(2, spiedList.size());

    Mockito.doReturn(100).when(spiedList).size();
    assertEquals(100, spiedList.size());
}
```

> mock 是模拟整个生成一个假对象，spy 像是间谍潜伏在真实对象里去篡改行为。

> **@Mock和@Spy的区别**
> 1. 在使用 @Mock 时，mockito 创建了类的一个基础套壳实例，完全用于跟踪与它的全部交互行为。这不是一个真正的对象，并且不维护状态，不存在更改。
> 2. 当使用 @Spy 时，mockito 创建一个类的真实实例，可以跟踪与它的每个交互行为，这个真实类能维护类状态的变化。

### @Captor

`@Captor` 注释用于创建 `ArgumentCaptor` 实例，该实例用于捕获方法参数值，来用于进一步做断言验证。mockito 使用参数类的 `equals()` 方法验证参数值是否相同。

不使用 `@Captor` 注解，手动创建一个 `ArgumentCaptor`:

```java
@Test
public void whenUseCaptorAnnotation_thenTheSame() {
    List mockList = Mockito.mock(List.class);
    ArgumentCaptor<String> arg = ArgumentCaptor.forClass(String.class);

    mockList.add("one");
    Mockito.verify(mockList).add(arg.capture());

    assertEquals("one", arg.getValue());
}
```

使用 `@Captor` 注解来创建 `ArgumentCaptor`:

```java
@Mock
List mockedList;

@Captor
ArgumentCaptor argCaptor;

@Test
public void whenUseCaptorAnnotation_thenTheSam() {
    mockedList.add("one");
    Mockito.verify(mockedList).add(argCaptor.capture());

    assertEquals("one", argCaptor.getValue());
}

```

### @InjectMocks

在 mockito 中，我们需要创建被测试的类对象，然后插入它的依赖项(mock)来完全测试行为。因此，我们要用到 `@InjectMocks` 注释。

`@InjectMocks` 标记了一个应该执行注入的字段。Mockito 会按照下面优先级通过构造函数注入、setter 注入或属性注入，来尝试注入你标识的 mock。如果上面三种任何给定的注入策略注入失败了，**Mockito 不会报错**。

`@InjectMocks` 一般是你要测的类，他会把要测类的 mock 属性自动注入进去。`@Mock` 则是你要造假模拟的类。

在下面的示例中，我们将使用 `@InjectMocks` 把 mock 的 *wordMap* 注入到 `MyDictionary` *dic* 中：

```java
@Mock
Map<String, String> wordMap;

@InjectMocks
MyDictionary dic = new MyDictionary();

@Test
public void whenUseInjectMocksAnnotation_thenCorrect() {
    Mockito.when(wordMap.get("aWord")).thenReturn("aMeaning");

    assertEquals("aMeaning", dic.getMeaning("aWord"));
}
```

下面是 `MyDictionary` 类:

```java
public class MyDictionary {
    Map<String, String> wordMap;

    public MyDictionary() {
        wordMap = new HashMap<String, String>();
    }
    public void add(final String word, final String meaning) {
        wordMap.put(word, meaning);
    }
    public String getMeaning(final String word) {
        return wordMap.get(word);
    }
}
```

## mock 函数的用法

1. **简单 mock**

mock 有好几个重载方法，最简单的一个只需传入被 mock 的 class：

```java
public static <T> T mock(Class<T> classToMock)
```

使用此方法来mock一个类：

```java
MyList listMock = mock(MyList.class);
```

2. **指定 mock 的名字**

mock 的第二个重载方法，第二个参数指定了 mock 的名称：

```java
public static <T> T mock(Class<T> classToMock, String name)
```

一般来说，这个名字没啥用。不过，它在调试时可能会有所帮助，因为我们会使用 mock 的名字来追踪错误。

3. **自定义Answer**

在创建时配置 mock 对交互的 *answer* 的策略。 该方法的定义如下所示：

```java
public static <T> T mock(Class<T> classToMock, Answer defaultAnswer)
```

`Answer` 接口的实现定义：

```java
class CustomAnswer implements Answer<Boolean> {

    @Override
    public Boolean answer(InvocationOnMock invocation) throws Throwable {
        return false;
    }
}
```

使用上面的 CustomAnswer 类来生成mock：

```java
MyList listMock = mock(MyList.class, new CustomAnswer());
```
**MockSettings**
如果我们不对方法设置期望值，`CustomAnswer` 类型配置的默认 *answer* 就会发挥作用。

4. 

最后一个 mock 方法是带有 `MockSettings` 参数的重载方法。我们使用这个重载方法来提供一个非标准的 mock 。

`MockSettings` 接口的方法支持多种自定义设置，例如使用 `invocationListeners` 为当前 mock 上的方法调用注册监听器、使用 `serializable` 配置序列化、使用 `spiedInstance` 指定要监视的实例、使用 `useConstructor` 配置 Mockito 在实例化 mock 时尝试使用构造函数等。

`MockSettings` 对象由工厂方法实例化：

```java
MockSettings customSettings = withSettings().defaultAnswer(new CustomAnswer());
```

在创建新的 mock 时使用该设置对象：

```java
MyList listMock = mock(MyList.class, customSettings);
```

## when/then 函数的用法

> **Stub 打桩** \
> Mockito 中 when().thenReturn(); 这种语法来定义对象方法和参数（输入），然后在 thenReturn 中指定结果（输出）。此过程称为 Stub 打桩 。一旦这个方法被 stub 了，就会一直返回这个 stub 的值。

{% noteblock error:: 注意%}
- 对于 static 和 final 方法， Mockito 无法对其 when(…).thenReturn(…) 操作。
- 当我们连续两次为同一个方法使用 stub 的时候，他只会只用最新的一次。
{% endnoteblock %}

以MyList类为例：

```java
public class MyList extends AbstractList<String> {

    @Override
    public String get(final int index) {
        return null;
    }
    @Override
    public int size() {
        return 1;
    }
}
```

1. **when().thenReturn() 模拟方法的返回**

```java
MyList listMock = Mockito.mock(MyList.class);
when(listMock.add(anyString())).thenReturn(false);

boolean added = listMock.add(randomAlphabetic(6));
assertThat(added, is(false));
```

2. **doReturn().when() 模拟方法的返回**

```java
MyList listMock = Mockito.mock(MyList.class);
doReturn(false).when(listMock).add(anyString());

boolean added = listMock.add(randomAlphabetic(6));
assertThat(added, is(false));
```

3. **when().thenThrow() 模拟异常(方法返回类型非 void )**

```java
@Test(expected = IllegalStateException.class)
public void givenMethodIsConfiguredToThrowException_whenCallingMethod_thenExceptionIsThrown() {
    MyList listMock = Mockito.mock(MyList.class);
    when(listMock.add(anyString())).thenThrow(IllegalStateException.class);

    listMock.add(randomAlphabetic(6));
}
```

4. **doThrow().when() 模拟异常(方法返回类型为 void )**

```java
MyList listMock = Mockito.mock(MyList.class);
doThrow(NullPointerException.class).when(listMock).clear();

listMock.clear();
```

5. **模拟方法的多次调用**

第二次调用 add 方法会抛出 `IllegalStateException`。

```java
MyList listMock = Mockito.mock(MyList.class);
when(listMock.add(anyString()))
  .thenReturn(false)
  .thenThrow(IllegalStateException.class);

listMock.add(randomAlphabetic(6));
listMock.add(randomAlphabetic(6)); // will throw the exception
```

6. **thenCallRealMethod() 调用 mock 对象的真实方法**

```java
MyList listMock = Mockito.mock(MyList.class);
when(listMock.size()).thenCallRealMethod();

assertThat(listMock.size(), equalTo(1));
```

7. **doAnswer().when() 设置默认返回**

```java
MyList listMock = Mockito.mock(MyList.class);
doAnswer(invocation -> "Always the same").when(listMock).get(anyInt());

String element = listMock.get(1);
assertThat(element, is(equalTo("Always the same")));
```

8. **doNothing().when().notify() 跳过 void 方法**

```java
doNothing().when(obj).notify();
```

9. **when(obj).notify() 跳过 void 方法**

```java
when(obj).notify();
```

## verify 函数的用法

> Mockito Verify 方法用于检查是否发生了某些行为。我们可以在测试方法代码的末尾使用 Mockito 验证方法，以确保调用了指定的方法。

1. **在模拟列表对象上仅调用一次add（"Pankaj"）**

```java
@Test
void test() {
	List<String> mockList = mock(List.class);
	mockList.add("Pankaj");
	mockList.size();
	verify(mockList).add("Pankaj");
}
```

与通过verify方法使用times（1）参数调用相同

```java
verify(mockList, times(1)).size();
```

2. **验证调用次数**

```java
verify(mockList, times(1)).size(); //same as normal verify method
verify(mockList, atLeastOnce()).size(); // must be called at least once
verify(mockList, atMost(2)).size(); // must be called at most 2 times
verify(mockList, atLeast(1)).size(); // must be called at least once
verify(mockList, never()).clear(); // must never be called
```

3. **verifyNoMoreInteractions()**

在所有验证方法之后可以使用此方法，以确保所有交互都得到验证。如果模拟对象上存在任何未验证的交互，它将使测试失败。

```java
// all interactions are verified, so below will pass
verifyNoMoreInteractions(mockList);
mockList.isEmpty();
// isEmpty() is not verified, so below will fail
verifyNoMoreInteractions(mockList);
```

4. **verifyZeroInteractions()**

`verifyZeroInteractions()` 方法的行为与 `verifyNoMoreInteractions()` 方法相同。

```java
Map mockMap = mock(Map.class);
Set mockSet = mock(Set.class);
verify(mockList).isEmpty();
verifyZeroInteractions(mockList, mockMap, mockSet);
```

5. **验证仅方法调用**

如果要验证仅调用了一个方法，则可以将 `only()` 与 verify 方法一起使用。

```java
Map mockMap = mock(Map.class);
mockMap.isEmpty();
verify(mockMap, only()).isEmpty();
```

6. **验证调用顺序**

我们可以使用 `InOrder` 来验证调用顺序。我们可以跳过任何方法进行验证，但是要验证的方法必须以相同的顺序调用。

```java
List<String> mockedList = mock(MyList.class);
mockedList.size();
mockedList.add("a parameter");
mockedList.clear();

InOrder inOrder = Mockito.inOrder(mockedList);
inOrder.verify(mockedList).size();
inOrder.verify(mockedList).add("a parameter");
inOrder.verify(mockedList).clear();
```