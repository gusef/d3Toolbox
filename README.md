# d3Toolbox

Interactive Shiny visualizations based on d3.js

## Install from Github
```{r install, eval=FALSE}
library(devtools)
install_github("gusef/d3Toolbox")
```

## Simple Scatterplot
```{r simple_scatter, warning=FALSE, eval=FALSE}
require(d3Toolbox)
data("iris")
data <- data.frame(x=iris$Sepal.Length,
                   y=iris$Sepal.Width,
                   z=iris$Petal.Length,
                   Species=iris$Species)
 
legend <- data.frame(col=c('steelblue','orange','black'),
                     name=levels(iris$Species))
    
d3Scatter(data,
          col=c('steelblue','orange','black')[as.numeric(iris$Species)],
          dotsize = 6,
          xlab='Sepal Length',
          ylab='Sepal Width',
          title='Iris dataset',
          subtitle='subtitle',
          tooltip = c('Species','z'),
          legend = legend,
          callback_handler='ScatterSelection')
```

## Simple Boxplot
```{r simple_box, warning=FALSE, eval=FALSE}
require(d3Toolbox)
data <- lapply(levels(iris$Species),
                      function(x,y)y[y$Species==x,'Sepal.Length'],
                      iris)
names(data) <- levels(iris$Species)
d3Boxplot(data,
          col=c('steelblue','orange','grey'),
          dotsize = 3,
          showdots = F,
          xlab='Sepal Length',
          ylab='Sepal Width',
          title='Iris dataset',
          subtitle='subtitle',
          callback_handler='ScatterSelection')
```

## Simple Barplot
```{r simple_barplot, warning=FALSE, eval=FALSE}
require(d3Toolbox)
data <- 1:15
names(data) <- c(LETTERS[1:15])

d3Barplot(data,
          col=c('steelblue'),
          xlab='Letters',
          ylab='Frequencies',
          title='New Barplot',
          subtitle='with subtitle')
```

## Stacked barplot with tooltips
```{r stacked_barplot, eval=FALSE}
data <- data.frame(x=(1:15),
                   y=(1:15)/2,
                   z=15:1)
rownames(data) <- c(LETTERS[1:15])

d3Barplot(data,
          col=c('steelblue','grey','#de2d26'),
          tooltip=c(paste0('letter_',LETTERS[1:15])),
          xlab='Letters',
          ylab='Frequencies',
          title='New Barplot',
          subtitle='with subtitle')
```

## Dendrograms
```{r dendrogram1, eval=FALSE}
dat <- t(mtcars)
hc01.col <- hcopt(dist(t(dat)),method="ward.D")
dend <- as.dendrogram(hc01.col)
d3Dendrogram(dend,
             horiz=T)
```

```{r dendrogram2, eval=FALSE}
dat <- mtcars
hc01.col <- hcopt(dist(t(dat)),method="ward.D")
dend <- as.dendrogram(hc01.col)
d3Dendrogram(dend,
             lab_adj = 40,
             classic_tree = F,
             callback_handler="DendSelection")
```
## Shiny
There are several Shiny examples using all these plots in the example directory.
